import { type GraphQLSchema } from 'graphql'
import { createYoga } from 'graphql-yoga'

export const yogaServer = async (schema: GraphQLSchema) => {
  const yoga = createYoga({
    schema,
  })

  return yoga
}
