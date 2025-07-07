import { Route } from '@/database/entities/route.entity'
import { Arg, ID, Query, Resolver } from 'type-graphql'

@Resolver(Route)
export class RouteQueriesResolver {
  @Query(() => [Route])
  async routes(): Promise<Route[]> {
    const routes = await Route.createQueryBuilder('route')
      .leftJoinAndSelect('route.routeStops', 'routeStop')
      .leftJoinAndSelect('routeStop.stop', 'stop')
      .orderBy('routeStop.sequence', 'ASC')
      .getMany()

    return routes
  }

  @Query(() => Route)
  async route(@Arg('id', () => ID) id: string): Promise<Route> {
    const route = await Route.findOne({ where: { id } })
    if (!route) {
      throw new Error(`Route with id: ${id} not found`)
    }

    return route
  }
}
