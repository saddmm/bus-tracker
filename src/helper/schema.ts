import { BusQueriesResolver } from '@/resolver/bus/bus.queries.resolver'
import { LocationResolver } from '@/resolver/bus/bus.subscription.resolver'
import { container } from 'tsyringe'
import { buildSchema } from 'type-graphql'
import { pubSub } from './pubsub'
import { RouteMutationResolver } from '@/resolver/route/route.mutation.resolver'
import { RouteQueriesResolver } from '@/resolver/route/route.queries.resolver'
import { StopMutationResolver } from '@/resolver/stop/stop.mutations.resolver'
import { StopQueriesResolver } from '@/resolver/stop/stop.queries.resolver'
import { BusMutationResolver } from '@/resolver/bus/bus.mutation.resolver'

export const schemaHelper = () => {
  return buildSchema({
    resolvers: [
      BusQueriesResolver,
      LocationResolver,
      RouteMutationResolver,
      RouteQueriesResolver,
      StopMutationResolver,
      StopQueriesResolver,
      BusMutationResolver,
    ],
    pubSub: pubSub,
    container: {
      get: someClass => container.resolve(someClass),
    },
    validate: false,
  })
}
