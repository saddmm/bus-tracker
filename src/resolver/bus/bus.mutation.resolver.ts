import { Bus } from '@/database/entities/bus.entity'
import { Route } from '@/database/entities/route.entity'
import { TraccarService } from '@/services/traccar.service'
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
  ) {}

  @Mutation(() => BusResponse)
  async createBus(
    @Args(() => BusParams)
    { uniqueId, name, capacity, routeId, type }: BusParams,
  ): Promise<BusResponse> {
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

    const route = await Route.findOneBy({ id: routeId })
    if (!route) throw new Error('route not found')
    bus.route = route

    await bus.save()
    console.log(bus)

    return {
      data: bus,
      msg: 'Success',
      success: true,
    }
  }
}
