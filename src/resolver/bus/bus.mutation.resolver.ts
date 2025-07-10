import { Bus } from '@/database/entities/bus.entity'
import { Route } from '@/database/entities/route.entity'
import { BusService } from '@/services/bus.service'
import { TraccarService } from '@/services/traccar.service'
import type { Device } from '@/types/object/device.object'
import { BusResponse } from '@/types/object/respons.object'
import { BusParams } from '@/types/params/bus.param'
import { inject, injectable } from 'tsyringe'
import { Args, Mutation, Resolver } from 'type-graphql'

@injectable()
@Resolver(Bus)
export class BusMutationResolver {
  constructor(
    @inject(TraccarService)
    private readonly traccarService: TraccarService,

    @inject(BusService)
    private readonly busService: BusService,
  ) {}

  @Mutation(() => BusResponse)
  async createBus(
    @Args(() => BusParams)
    { uniqueId, name, capacity, routeId, type }: BusParams,
  ): Promise<BusResponse> {
    try {
      const device = await this.traccarService.createDevice({
        name,
        uniqueId,
        category: 'Bus',
      })
      // console.log(device)
      const bus = Bus.create({
        ...device,
        type,
        capacity,
      })

      const busRedis: Device = {
        ...device,
        category: type,
        capacity,
      }

      if (routeId) {
        const route = await Route.findOneBy({ id: routeId })
        if (!route) throw new Error('route not found')
        bus.route = route
        busRedis.routeId = routeId
      }

      await bus.save()
      await this.busService.addBus(busRedis)

      return {
        data: bus,
        msg: 'Success',
        success: true,
      }
    } catch (err: any) {
      return {
        msg: err,
        success: false,
      }
    }
  }
}
