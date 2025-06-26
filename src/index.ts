import express from 'express'
import 'reflect-metadata'
import 'dotenv/config'
import cors from 'cors'
import { AppDataSource } from './database/data-source'
import { createServer } from 'http'
import { expressMiddleware } from '@apollo/server/express4'
import { apolloServer } from './helper/apollo-server'
import { schemaHelper } from './helper/schema'

export const server = async () => {
  const port = process.env.PORT || 4000
  console.log('Starting server...')

  const app = express()
  const httpServer = createServer(app)

  const schema = await schemaHelper()

  const server = await apolloServer(httpServer, schema)

  app.use(express.json())
  app.use(
    cors({
      origin: '*',
    }),
  )

  app.use((req, res, next) => {
    if (!req.body && process.env.NODE_ENV !== 'production') {
      req.body = {}
    }
    next()
  })

  app.use('/graphql', expressMiddleware(server) as unknown as express.RequestHandler)

  await AppDataSource.initialize()

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 4000}/graphql`)
  })
}

server().catch(error => {
  console.error('Error starting server:', error)
  process.exit(1)
})
