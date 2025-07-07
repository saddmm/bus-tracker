import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { inject, injectable } from 'tsyringe'
import 'dotenv/config'
import type { Route } from '@/database/entities/route.entity'
import type { StopInput } from '@/types/params/route.param'
import { RouteStop } from '@/database/entities/route-stop.entity'
import { Stop } from '@/database/entities/stop.entity'
import { StopService } from './stop.service'

@injectable()
export class RouteService {
  private axiosInstance: AxiosInstance
  constructor(
    @inject(StopService)
    private readonly stopService: StopService,
  ) {
    this.axiosInstance = axios.create({
      baseURL: process.env.GRAPHHOPPER_HOST,
    })
  }

  async createPolyline(locations: any) {
    try {
      const response = await this.axiosInstance.post('/route', {
        points: locations,
        profile: 'car',
        locale: 'id',
        calc_points: true,
        points_encoded: true,
      })

      const polyline = response.data.paths[0].points

      return polyline
    } catch (err: any) {
      throw new Error(err)
    }
  }

  async updateRoute(route: Route, stops: StopInput[]): Promise<void> {
    if (!stops) {
      throw new Error('Input halte tidak boleh kosong.')
    }

    const currentRouteStops = await RouteStop.find({
      where: { route: { id: route.id } },
      relations: ['stop'],
    })

    const desiredStopsWithSeq = await this.stopService.stopSequence(stops)

    const currentStopMap = new Map(currentRouteStops.map(rs => [rs.stop.id, rs]))
    const desiredStopMap = new Map(desiredStopsWithSeq.map(ds => [ds.stopId, ds]))

    const toCreate: RouteStop[] = []
    const toUpdate: RouteStop[] = []
    const toDelete: RouteStop[] = []

    for (const current of currentRouteStops) {
      const desired = desiredStopMap.get(current.stop.id)
      if (desired) {
        if (current.sequence !== desired.sequence) {
          current.sequence = desired.sequence
          toUpdate.push(current)
        }
      } else {
        toDelete.push(current)
      }
    }

    for (const desired of desiredStopsWithSeq) {
      if (!currentStopMap.has(desired.stopId)) {
        const stopEntity = await Stop.findOneBy({ id: desired.stopId })
        if (!stopEntity) throw new Error(`Halte ${desired.stopId} tidak ditemukan`)

        const newRouteStop = RouteStop.create({
          route,
          stop: stopEntity,
          sequence: desired.sequence,
        })
        toCreate.push(newRouteStop)
      }
    }

    if (toDelete.length > 0) {
      await RouteStop.remove(toDelete)
    }
    if (toUpdate.length > 0) {
      await RouteStop.save(toUpdate)
    }
    if (toCreate.length > 0) {
      await RouteStop.save(toCreate)
    }

    const finalOrderedStops = await this.stopService.findStopsInOrder(
      desiredStopsWithSeq.sort((a, b) => a.sequence - b.sequence).map(s => s.stopId),
    )
    const locations = finalOrderedStops.map(s => [s.location.longitude, s.location.latitude])
    const polyline = await this.createPolyline(locations)
    route.polyline = polyline
    await route.save()
  }
}
