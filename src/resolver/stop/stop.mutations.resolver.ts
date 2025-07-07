import { Stop } from '@/database/entities/stop.entity'
import { StopResponse } from '@/types/object/respons.object'
import { StopParams } from '@/types/params/stop.params'
import { Args, Mutation, Resolver } from 'type-graphql'

@Resolver(Stop)
export class StopMutationResolver {
  @Mutation(() => StopResponse)
  async createStop(@Args(() => StopParams) stopParams: StopParams): Promise<StopResponse> {
    const stop = Stop.create({
      name: stopParams.name,
      location: stopParams.location,
    })
    await stop.save()

    return { data: stop, msg: 'Stop created successfully', success: true }
  }
}
