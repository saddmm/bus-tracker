import { BusResolver } from '@/resolver/bus/bus.resolver'
import { LocationResolver } from '@/resolver/bus/location.resolver'
import { container } from 'tsyringe'
import { buildSchema } from 'type-graphql'

export const schemaHelper = () => {
  return buildSchema({
    resolvers: [BusResolver, LocationResolver],
    container: {
      get: someClass => container.resolve(someClass),
    },
    validate: true,
  })
}
