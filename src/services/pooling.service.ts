import { redis } from '@/config/redis'
import { injectable } from 'tsyringe'

const SUBSCRIBER_COUNTER_KEY = 'poll:sub_counts'
// const LEASE_KEY_PREFIX = 'poll:lease:'
// const LEASE_SECONDS = 30
// const POLLING_INTERVAL_MS = 10000

@injectable()
export class PoolingService {
  async addSubscriber(topic: string): Promise<void> {
    const totalSubscriber = await redis.hIncrBy(SUBSCRIBER_COUNTER_KEY, topic, 1)
    console.log(`topic: ${topic}, total subscriber: ${totalSubscriber}`)
  }

  async removeSubscriber(topic: string): Promise<void> {
    const totalSubscriber = await redis.hIncrBy(SUBSCRIBER_COUNTER_KEY, topic, -1)
    console.log(`topic: ${topic}, total subscriber: ${totalSubscriber}`)
  }
}
