import { Route } from '@/database/entities/route.entity'
import { RouteService } from '@/services/route.service'
import { RouteParams } from '@/types/params/route.param'
import { inject, injectable } from 'tsyringe'
import { Arg, Args, Mutation, Resolver } from 'type-graphql'

@injectable()
@Resolver(Route)
export class RouteMutationResolver {
  constructor(
    @inject(RouteService)
    private readonly routeService: RouteService,
  ) {}

  @Mutation(() => Route)
  async createRoute(
    @Args(() => RouteParams)
    { name, operation_day, start_hour, end_hour, stops }: RouteParams,
  ): Promise<Route> {
    try {
      const route = Route.create({
        name,
        operation_day,
        start_hour,
        end_hour,
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
    @Arg('id', () => String) id: string,
    @Args(() => RouteParams) { name, operation_day, start_hour, end_hour, stops }: RouteParams,
  ): Promise<Route> {
    try {
      const route = await Route.findOneBy({ id })
      if (!route) {
        throw new Error('Route Not Found')
      }
      route.name ||= name
      route.operation_day ||= operation_day
      route.start_hour ||= start_hour
      route.end_hour ||= end_hour
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
