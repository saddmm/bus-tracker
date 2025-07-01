import { createClient } from 'redis'
import 'dotenv/config'

export class RedisService {
  private client: any

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    })

    this.client.on('error', (err: Error) => {
      console.error('Redis Client Error', err)
    })

    this.client.connect().catch((err: Error) => {
      console.error('Failed to connect to Redis:', err)
    })
  }

  async setAll(key: string, values: any[]): Promise<void> {
    const multi = this.client.multi()
    values.forEach((value: any) => {
      const keys = `${key}:${value.id}`
      multi.SET(keys, JSON.stringify(value))
      multi.SADD(key, value.id.toString())
    })

    return await multi.exec()
  }

  async getAll(key: string): Promise<string | null> {
    const allKeys = await this.client.SMEMBERS(`${key}:all`)
    if (allKeys.length === 0) {
      return null
    }
    const allDataStrings = await this.client.mGet(allKeys)

    return allDataStrings.map((data: any) => JSON.parse(data || '{}'))
  }
}
