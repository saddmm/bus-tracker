import { redis } from '@/config/redis'
import 'dotenv/config'

export class RedisService {
  async setAll(key: string, values: any[]): Promise<void> {
    const multi = redis.multi()
    values.forEach((value: any) => {
      const keys = `${key}:${value.id}`
      multi.set(keys, JSON.stringify(value))
      multi.sAdd(`${key}s:all`, value.id.toString())
    })

    await multi.exec()
  }

  async getAll(key: string): Promise<any[] | null> {
    const ids = await redis.SMEMBERS(`${key}s:all`)
    if (ids.length === 0) {
      return null
    }
    const allKeys = ids.map(id => `${key}:${id}`)
    const allDataStrings = await redis.mGet(allKeys)

    const result = allDataStrings.map((data: any) => JSON.parse(data || '{}'))

    return result
  }

  async get(key: string, id: string): Promise<any> {
    const data = await redis.get(`${key}:${id}`)
    if (!data) {
      return null
    }

    return JSON.parse(data)
  }
}
