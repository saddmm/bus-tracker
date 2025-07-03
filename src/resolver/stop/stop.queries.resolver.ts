import { Stop } from '@/database/entities/stop.entity'
import { Query, Resolver } from 'type-graphql'

@Resolver(Stop)
export class StopQueriesResolver {
  @Query(() => [Stop])
  async stops(): Promise<Stop[]> {
    return Stop.find() || []
  }
}
