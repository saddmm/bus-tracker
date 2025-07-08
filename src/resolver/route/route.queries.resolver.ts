import { Route } from '@/database/entities/route.entity'
import { RouteService } from '@/services/route.service'
import { RouteWithStopResponse, RouteWithStopResponses } from '@/types/object/respons.object'
import { inject, injectable } from 'tsyringe'
import { Arg, ID, Query, Resolver } from 'type-graphql'

@injectable()
@Resolver(Route)
export class RouteQueriesResolver {
  constructor(
    @inject(RouteService)
    private readonly routeService: RouteService,
  ) {}

  @Query(() => RouteWithStopResponses)
  async routes(): Promise<RouteWithStopResponses> {
    const routes = await this.routeService.routeQuery()

    return {
      data: routes || [],
      msg: 'Fetch Successfully',
      success: true,
    }
  }

  @Query(() => RouteWithStopResponse)
  async route(@Arg('id', () => ID) id: string): Promise<RouteWithStopResponse> {
    const route = await this.routeService.routeQueryById(id)
    if (!route) {
      throw new Error(`Route with id: ${id} not found`)
    }

    return {
      data: route,
      msg: 'Suces',
      success: true,
    }
  }
}
