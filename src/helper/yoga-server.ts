import { type GraphQLSchema } from 'graphql'
import { createYoga } from 'graphql-yoga'
import { renderApolloSandbox } from '@graphql-yoga/render-apollo-sandbox'
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse'

export const yogaServer = async (schema: GraphQLSchema) => {
  const yoga = createYoga({
    schema,
    plugins: [useGraphQLSSE()],
    graphiql: {
      subscriptionsProtocol: 'SSE',
    },
  })

  return yoga
}

export const renderApolloSandboxPage = () => {
  return renderApolloSandbox()
}
