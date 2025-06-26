import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { type GraphQLSchema } from 'graphql'
import type http from 'http'

export const apolloServer = async (httpServer: http.Server, schema: GraphQLSchema) => {
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  await server.start()

  return server
}
