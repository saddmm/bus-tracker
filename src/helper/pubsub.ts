import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis from 'ioredis'
import 'dotenv/config'

const options = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000)
  },
}

const publisher = new Redis(options)
const subscriber = new Redis(options)

publisher.on('connect', () => {
  console.log('✅ Klien Publisher Redis terhubung.')
})
subscriber.on('connect', () => {
  console.log('✅ Klien Subscriber Redis terhubung.')
})
publisher.on('error', err => {
  console.error('❌ Gagal menghubungkan klien Publisher Redis:', err)
})
subscriber.on('error', err => {
  console.error('❌ Gagal menghubungkan klien Subscriber Redis:', err)
})

export const pubSub = new RedisPubSub({
  publisher,
  subscriber,
})
