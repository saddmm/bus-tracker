import { redis } from '@/config/redis'
import { pubSub } from './pubsub'

interface ManageAsyncIteratorOptions {
  onStart?: () => void | Promise<void>
  onStop?: () => void | Promise<void>
}

export async function manageAsyncIterator<T>(
  topic: string,
  options: ManageAsyncIteratorOptions,
): Promise<AsyncIterableIterator<T>> {
  const countKey = `subscriber:count:${topic}`

  const newCount = await redis.incr(countKey)
  if (newCount === 1) {
    console.log(`Starting async iterator for topic: ${topic}`)
    await options.onStart?.()
  }

  const source = pubSub.subscribe(topic)

  const manageIterator: AsyncIterableIterator<T> = {
    next() {
      return source.next()
    },

    async return() {
      const remainingCount = await redis.decr(countKey)

      if (remainingCount === 0) {
        console.log('Stopping')
        await options.onStop?.()
        await redis.del(countKey)
      }

      return source.return?.() ?? Promise.resolve({ done: true, value: undefined })
    },

    async throw(error) {
      console.error(`Error in async iterator for topic: ${topic}`, error)

      const remainingCount = await redis.decr(countKey)
      if (remainingCount <= 0) {
        console.log(`Stopping async iterator for topic (on error): ${topic}`)
        await options.onStop?.()
        await redis.del(countKey)
      }

      return Promise.reject(error)
    },

    [Symbol.asyncIterator]() {
      return this
    },
  }

  return manageIterator
}
