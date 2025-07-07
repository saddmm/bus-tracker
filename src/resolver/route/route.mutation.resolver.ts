import { Route } from '@/database/entities/route.entity'
import { RouteService } from '@/services/route.service'
import { StopService } from '@/services/stop.service'
import { CreateRouteParams, UpdateRouteParams } from '@/types/params/route.param'
import { inject, injectable } from 'tsyringe'
import { Args, Mutation, Resolver } from 'type-graphql'

@injectable()
@Resolver(Route)
export class RouteMutationResolver {
  constructor(
    @inject(RouteService)
    private readonly routeService: RouteService,

    @inject(StopService)
    private readonly stopService: StopService,
  ) {}

  @Mutation(() => Route)
  async createRoute(
    @Args(() => CreateRouteParams)
    { name, stops }: CreateRouteParams,
  ): Promise<Route> {
    try {
      const route = Route.create({
        name,
      })

      await route.save()
      if (stops) {
        if (stops.length < 2) {
          throw new Error('Tambahkan minimal 2 halte')
        }

        await this.routeService.updateRoute(route, stops)
      }

      return route
    } catch (err: any) {
      throw new Error(err)
    }
  }

  @Mutation(() => Route)
  async updateRoute(
    @Args(() => UpdateRouteParams) { id, name, stops }: UpdateRouteParams,
  ): Promise<Route> {
    try {
      const route = await Route.findOneBy({ id })
      if (!route) {
        throw new Error('Route Not Found')
      }
      if (name) route.name = name
      if (stops) {
        if (stops.length < 2) {
          throw new Error('Tambahkan minimal 2 halte')
        }

        await this.routeService.updateRoute(route, stops)
      }

      return route
    } catch (err: any) {
      throw new Error(`Error : ${err}`)
    }
  }
}
