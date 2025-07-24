import { redis } from '@/config/redis'
import 'dotenv/config'
import { injectable } from 'tsyringe'

@injectable()
export class RedisService {
  async setAll(key: string, values: any[]): Promise<void> {
    const multi = redis.multi()
    values.forEach((value: any) => {
      const keys = `${key}:${value.id}`
      multi.json.set(keys, '.', value)
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
    const result = await redis.mGet(allKeys)

    return result
  }

  async get(key: string, id: string): Promise<any> {
    const data = await redis.get(`${key}:${id}`)
    if (!data) {
      return null
    }

    return data
  }

  async set(key: string, value: any): Promise<void | Error> {
    try {
      const multi = redis.multi()
      multi.json.set(`${key}:${value.id}`, '.', value)
      multi.sAdd(`${key}s:all`, value.id.toString())
      await multi.exec()
    } catch (err: any) {
      throw new Error(`Redis Error: ${err}`)
    }
  }
}
