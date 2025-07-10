import Redis from 'ioredis'
import 'dotenv/config'
import { createPubSub } from 'graphql-yoga'
import { createRedisEventTarget } from '@graphql-yoga/redis-event-target'

const options = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000)
  },
}

const publisher = new Redis(options)
const subscriber = new Redis(options)

const eventTarget = createRedisEventTarget({
  publishClient: publisher,
  subscribeClient: subscriber,
})

export const pubSub = createPubSub({ eventTarget })
