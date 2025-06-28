import { createClient } from 'redis'
import 'dotenv/config'

export const redis = createClient({
  url: process.env.REDIS_URL,
})

redis.on('connect', () => console.log(`Redis Connected `))

redis.on('error', err => console.log('Redis connection error: ', err))

export const getDeviceKey = (deviceId: number): string => `device:${deviceId}`
