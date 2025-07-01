import { BusResolver } from '@/resolver/bus/bus.resolver'
import { LocationResolver } from '@/resolver/bus/location.subscription'
import { container } from 'tsyringe'
import { buildSchema } from 'type-graphql'
import { pubSub } from './pubsub'

export const schemaHelper = () => {
  return buildSchema({
    resolvers: [BusResolver, LocationResolver],
    pubSub: pubSub as any,
    container: {
      get: someClass => container.resolve(someClass),
    },
    validate: false,
  })
}
