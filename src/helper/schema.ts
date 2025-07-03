import { BusResolver } from '@/resolver/bus/bus.resolver'
import { LocationResolver } from '@/resolver/bus/location.subscription.resolver'
import { container } from 'tsyringe'
import { buildSchema } from 'type-graphql'
import { pubSub } from './pubsub'
import { RouteMutationResolver } from '@/resolver/route/route.mutation.resolver'
import { RouteQueriesResolver } from '@/resolver/route/route.queries.resolver'
import { StopMutationResolver } from '@/resolver/stop/stop.mutations.resolver'

export const schemaHelper = () => {
  return buildSchema({
    resolvers: [
      BusResolver,
      LocationResolver,
      RouteMutationResolver,
      RouteQueriesResolver,
      StopMutationResolver,
    ],
    pubSub: pubSub as any,
    container: {
      get: someClass => container.resolve(someClass),
    },
    validate: false,
  })
}
