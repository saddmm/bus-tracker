import { inject, injectable } from 'tsyringe'
import 'dotenv/config'
import { Route } from '@/database/entities/route.entity'
import type { StopInput } from '@/types/params/route.param'
import { RouteStop } from '@/database/entities/route-stop.entity'
import { Stop } from '@/database/entities/stop.entity'
import { StopService } from './stop.service'
import type { RouteWithStop } from '@/types/object/route.object'
import { RedisService } from './redis.service'
import { MapsService } from './maps.service'
import { redis } from '@/config/redis'

// interface Position {
//   latitude: number
//   longitude: number
// }

@injectable()
export class RouteService {
  constructor(
    @inject(StopService)
    private readonly stopService: StopService,

    @inject(RedisService)
    private readonly redisService: RedisService,

    @inject(MapsService)
    private readonly mapsService: MapsService,
  ) {}

  private async updateRouteCache(route: Route): Promise<void> {
    const routeData = await this.routeQueryById(route.id)

    if (!routeData) return

    await this.redisService.set(`route`, routeData)
    console.log('berhasil')
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

    // POLYLINE
    const finalOrderedStops = await this.stopService.findStopsInOrder(
      desiredStopsWithSeq.sort((a, b) => a.sequence - b.sequence).map(s => s.stopId),
    )
    const locations = finalOrderedStops.map(s => [s.location.longitude, s.location.latitude])
    await redis.set(`longlat:${route.id}`, JSON.stringify(locations))
    const polyline = await this.mapsService.createPolyline(locations)
    route.polyline = polyline
    await route.save()

    await this.updateRouteCache(route)
  }

  async routeQuery(): Promise<RouteWithStop[] | null> {
    const routes = await Route.createQueryBuilder('route')
      .leftJoinAndSelect('route.routeStops', 'routeStop')
      .leftJoinAndSelect('routeStop.stop', 'stop')
      .orderBy('routeStop.sequence', 'ASC')
      .getMany()

    if (!routes) return null
    const routeData = routes.map(route => ({
      id: route.id,
      name: route.name,
      polyline: route.polyline,
      operation_day: route.operation_day,
      start_hour: route.start_hour,
      end_hour: route.end_hour,
      stops: route.routeStops?.map(rs => ({
        id: rs.stop.id,
        name: rs.stop.name,
        location: rs.stop.location,
        sequence: rs.sequence,
      })),
    }))

    return routeData
  }

  async routeQueryById(routeId: string): Promise<RouteWithStop | null> {
    const route = await Route.createQueryBuilder('route')
      .leftJoinAndSelect('route.routeStops', 'routeStop')
      .leftJoinAndSelect('routeStop.stop', 'stop')
      .where('route.id = :routeId', { routeId })
      .orderBy('routeStop.sequence', 'ASC')
      .getOne()

    if (!route) return null
    const routeData = {
      id: route.id,
      name: route.name,
      polyline: route.polyline,
      operation_day: route.operation_day,
      start_hour: route.start_hour,
      end_hour: route.end_hour,
      stops: route.routeStops?.map(rs => ({
        id: rs.stop.id,
        name: rs.stop.name,
        location: rs.stop.location,
        sequence: rs.sequence,
      })),
    }

    return routeData
  }
}
