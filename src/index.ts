import express from 'express'
import 'reflect-metadata'
import 'dotenv/config'
import cors from 'cors'
import { AppDataSource } from './database/data-source'
import { createServer } from 'http'
import { expressMiddleware } from '@apollo/server/express4'
import { apolloServer } from './helper/apollo-server'
import { schemaHelper } from './helper/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/use/ws'
import { container } from 'tsyringe'
import { TraccarService } from './services/traccar.service'
import type { MyContext } from './types/myContext'
import { redis } from './config/redis'
import type { Consumer, Producer } from 'kafkajs'
import { kafka } from './config/kafka'
import { PositionWorkerService } from './services/worker/positionWorker.service'

export const server = async () => {
  const port = process.env.PORT || 4000
  console.log('Starting server...')

  // Kafka
  const producer: Producer = kafka.producer()
  const consumer: Consumer = kafka.consumer({ groupId: 'bus-track-group' })
  await producer.connect()
  await consumer.connect()

  container.register<Producer>('KafkaProducer', { useValue: producer })
  container.register<Consumer>('KafkaConsumer', { useValue: consumer })

  const traccarService = container.resolve(TraccarService)
  const workerService = container.resolve(PositionWorkerService)

  await workerService.start()
  await traccarService.connectToWebSocket()

  const app = express()
  const httpServer = createServer(app)
  const schema = await schemaHelper()
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  const serverCleanup = useServer(
    {
      schema,
    },
    wsServer,
  )

  const server = await apolloServer(httpServer, schema, serverCleanup)

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

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async () => {
        return {
          pubSub: container.resolve('PubSub'),
          traccarService: container.resolve(TraccarService),
          container: container,
        } as MyContext
      },
    }) as unknown as express.RequestHandler,
  )

  await AppDataSource.initialize()
  await redis.connect().catch((err: Error) => {
    console.error('Failed to connect to Redis:', err)
  })

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 4000}/graphql`)
  })
}

server().catch(error => {
  console.error('Error starting server:', error)
  process.exit(1)
})
