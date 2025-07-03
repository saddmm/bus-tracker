import { createClient } from 'redis'

export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redis.on('error', (err: Error) => {
  console.error('Redis Client Error', err)
})
