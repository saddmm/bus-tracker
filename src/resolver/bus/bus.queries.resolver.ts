import { Bus } from '@/database/entities/bus.entity'
import { BusService } from '@/services/bus.service'
import { ActionRespons } from '@/types/object/respons.object'
import { inject, injectable } from 'tsyringe'
import { Arg, ID, Query, Resolver } from 'type-graphql'

@injectable()
@Resolver(() => Bus)
export class BusQueriesResolver {
  constructor(
    @inject(BusService)
    private readonly busService: BusService,
  ) {}

  @Query(() => ActionRespons)
  async lastBusLocation(@Arg('id', () => ID) id: string): Promise<ActionRespons> {
    const position = await this.busService.getBusLocationById(id)
    if (!position) {
      return {
        success: false,
        msg: 'Device not found',
      }
    }

    return {
      success: true,
      msg: 'Device position fetched successfully',
      data: position,
    }
  }
}
