import { Stop } from '@/database/entities/stop.entity'
import { StopResponses } from '@/types/object/respons.object'
import { Query, Resolver } from 'type-graphql'

@Resolver(Stop)
export class StopQueriesResolver {
  @Query(() => StopResponses)
  async stops(): Promise<StopResponses> {
    const stops: Stop[] = await Stop.find()

    return { data: stops, msg: 'Stops fetched successfully', success: true }
  }
}
