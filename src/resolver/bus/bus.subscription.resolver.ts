/* eslint-disable @typescript-eslint/no-unused-vars */
import { redis } from '@/config/redis'
import { manageAsyncIterator } from '@/helper/manageAsyncIterator'
import { EtaService } from '@/services/worker/eta.service'
import { BusWithEtaStop } from '@/types/object/bus.object'
import { Device } from '@/types/object/device.object'
import { container, injectable } from 'tsyringe'
import { Arg, Resolver, Root, Subscription } from 'type-graphql'

@injectable()
@Resolver(Device)
export class LocationResolver {
  constructor() {}

  @Subscription(() => [Device], {
    topics: 'POSITION_UPDATE',
  })
  async positionUpdate(
    @Root() devices: Device[],
    @Arg('routeId', () => String, { nullable: true }) routeId: string,
  ) {
    if (routeId) {
      return devices.filter(device => device.routeId === routeId)
    }

    return devices
  }

  @Subscription(() => BusWithEtaStop, {
    subscribe: ({ args }) => {
      const topic = `BUS_TO_STOP_${args.busId}`

      return manageAsyncIterator<BusWithEtaStop>(topic, {
        onStart: async () => {
          await redis.sAdd('worker:active_buses', args.busId)
        },
        onStop: async () => {
          await redis.sRem('worker:active_buses', args.busId)
        },
      })
    },
  })
  async busWithEtaStop(@Root() bus: BusWithEtaStop, @Arg('busId', () => String) busId: string) {
    return bus
  }
}
