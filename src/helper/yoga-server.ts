import { type GraphQLSchema } from 'graphql'
import { createYoga } from 'graphql-yoga'
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse'

export const yogaServer = async (schema: GraphQLSchema) => {
  const yoga = createYoga({
    schema,
    graphiql: {
      subscriptionsProtocol: 'SSE',
    },
    plugins: [
      useGraphQLSSE({
        onOperation: () => console.log('mulai'),
      }),
    ],
  })

  return yoga
}
