import { BusResolver } from '@/resolver/bus/bus.resolver'
import { LocationResolver } from '@/resolver/bus/location.resolver'
import { createPubSub } from 'graphql-yoga'
import { container } from 'tsyringe'
import { buildSchema } from 'type-graphql'

export const pubSub = createPubSub()

export const schemaHelper = () => {
  return buildSchema({
    resolvers: [BusResolver, LocationResolver],
    pubSub: pubSub,
    container: {
      get: someClass => container.resolve(someClass),
    },
  })
}
