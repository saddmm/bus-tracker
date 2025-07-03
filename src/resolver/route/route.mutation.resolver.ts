import { Route } from '@/database/entities/route.entity'
import { RouteService } from '@/services/route.service'
import { RouteParams } from '@/types/params/route.param'
import { inject, injectable } from 'tsyringe'
import { Args, Mutation, Resolver } from 'type-graphql'

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
    { startPoint, endPoint, startLocation, endLocation }: RouteParams,
  ): Promise<Route> {
    const name = `${startLocation} - ${endLocation}`
    const polyline = await this.routeService.createPolyline(startPoint, endPoint)
    const route = Route.create({
      name,
      polyline: polyline,
      origin: startPoint,
      destination: endPoint,
    })
    await route.save()

    return route
  }
}
