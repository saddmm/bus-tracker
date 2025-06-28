import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { type GraphQLSchema } from 'graphql'
import type http from 'http'

export const apolloServer = async (
  httpServer: http.Server,
  schema: GraphQLSchema,
  serverCleanup: any,
) => {
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  return server
}
