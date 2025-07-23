import { inject, injectable } from 'tsyringe'
import { RedisService } from '../redis.service'
import { StopService } from '../stop.service'
import { redis } from '@/config/redis'
import type { Device } from '@/types/object/device.object'
import { formatLongLat } from '@/helper/longLat'
import { MapsService } from '../maps.service'
import type { RouteWithStop } from '@/types/object/route.object'
import { pubSub } from '@/helper/pubsub'
import { LatLong } from '@/types/object/latlong.object'

@injectable()
export class EtaService {
  private intervalId: NodeJS.Timeout | null = null
  constructor(
    @inject(RedisService)
    private readonly redisService: RedisService,

    @inject(StopService)
    private readonly stopService: StopService,

    @inject(MapsService)
    private readonly mapsService: MapsService,
  ) {}

  async processCalculation() {
    const ACTIVE_BUSES_KEY: string = 'worker:active_buses'
    const ACTIVE_STOP_KEY: string = 'worker:active_stops'
    const activeBuses = await redis.sMembers(ACTIVE_BUSES_KEY)
    const activeStops = await redis.sMembers(ACTIVE_STOP_KEY)

    if (activeBuses.length === 0 && activeStops.length === 0) {
      return
    }

    for (const busId of activeBuses) {
      const bus: Device = await this.redisService.get('position', busId)
      const from_points: LatLong[] = [
        {
          lat: Number(bus.position!.latitude),
          lng: Number(bus.position!.longitude),
        },
      ]
      const to_points = await this.redisService.get('longlat', bus.routeId!)
      console.log('to_points', to_points)
      if (to_points.length === 0) {
        console.log('to_points 0')

        return
      }

      const route: RouteWithStop = await this.redisService.get('route', bus.routeId!)

      // API MATRIX
      const result = await this.mapsService.distanceMatrix(from_points, to_points)

      const busToStop = {
        ...bus,
        stops: route.stops?.map((stop, index) => {
          return {
            ...stop,
            distance: result.distances[0][index],
            eta: result.times[0][index],
          }
        }),
      }

      await this.redisService.set('bus_to_stop', busToStop)
      pubSub.publish(`BUS_TO_STOP_${busId}`, busToStop)
    }
  }

  startCalculation() {
    if (this.intervalId) {
      this.stopCalculation()
    }
    this.intervalId = setInterval(() => this.processCalculation(), 5000)
  }

  stopCalculation() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
