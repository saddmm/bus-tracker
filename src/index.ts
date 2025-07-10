import express from 'express'
import 'reflect-metadata'
import 'dotenv/config'
import cors from 'cors'
import { AppDataSource } from './database/data-source'
import { createServer } from 'http'
import { yogaServer } from './helper/yoga-server'
import { schemaHelper } from './helper/schema'
import { container } from 'tsyringe'
import { TraccarService } from './services/traccar.service'
import { redis } from './config/redis'
import type { Consumer, Producer } from 'kafkajs'
import { kafka } from './config/kafka'
import { PositionWorkerService } from './services/worker/positionWorker.service'

export const server = async () => {
  const port = process.env.PORT || 4000
  console.log('Starting server...')
  await redis.connect().catch((err: Error) => {
    console.error('Failed to connect to Redis:', err)
  })

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
  // const wsServer = new WebSocketServer({
  //   server: httpServer,
  //   path: '/graphql',
  // })

  // const serverCleanup = useServer(
  //   {
  //     schema,
  //   },
  //   wsServer,
  // )

  const yoga = await yogaServer(schema)

  // const wsServer = new WebSocketServer({
  //   server: httpServer,
  //   path: yoga.graphqlEndpoint,
  // })

  // useServer(
  //   {
  //     schema,
  //     context: {
  //       poolingService,
  //     },
  //     onSubscribe: async (ctx, msg: any) => {
  //       const { operationName } = msg.payload
  //       let topic = ''
  //       if (operationName === 'POSITION_UPDATE') {
  //         topic = `POSITION_UPDATE`
  //         console.log(`[WS onSubscribe] Pengguna terhubung ke topik global: ${topic}`)
  //       }
  //       await poolingService.addSubscriber(topic)
  //     },
  //     onComplete: async (ctx, msg: any) => {
  //       const { operationName } = msg.payload
  //       let topic = ''
  //       if (operationName === 'POSITION_UPDATE') topic = `POSITION_UPDATE`
  //       await poolingService.removeSubscriber(topic)
  //     },
  //   },
  //   wsServer,
  // )

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

  app.use('/graphql', yoga)

  // app.use('/graphql', expressMiddleware(server) as unknown as express.RequestHandler)

  await AppDataSource.initialize()

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 4000}/graphql`)
  })
}

server().catch(error => {
  console.error('Error starting server:', error)
  process.exit(1)
})
