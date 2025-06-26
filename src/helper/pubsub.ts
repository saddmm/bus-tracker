import 'dotenv/config'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis from 'ioredis'

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
})

// Setup Redis PubSub
export const pubSub = new RedisPubSub({
  publisher: redisClient,
  subscriber: redisClient,
})
