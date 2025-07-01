import { pubSub } from './pubsub'

const topicSubscriberCount = new Map<string, number>()

interface ManageAsyncIteratorOptions {
  onStart?: () => void | Promise<void>
  onStop?: () => void | Promise<void>
}

export function manageAsyncIterator<T>(
  topic: string,
  options: ManageAsyncIteratorOptions,
): AsyncIterableIterator<T> {
  const currentCount = topicSubscriberCount.get(topic) ?? 0

  if (currentCount === 0) {
    console.log(`Starting async iterator for topic: ${topic}`)
    options.onStart?.()
  }

  topicSubscriberCount.set(topic, currentCount + 1)

  const source = pubSub.asyncIterableIterator<T>(topic) as AsyncIterableIterator<T>

  const manageIterator: AsyncIterableIterator<T> = {
    next() {
      return source.next()
    },

    return() {
      const currentCount = topicSubscriberCount.get(topic) ?? 0
      if (currentCount > 1) {
        topicSubscriberCount.set(topic, currentCount - 1)
      } else {
        console.log(`Stopping async iterator for topic: ${topic}`)
        options.onStop?.()
        topicSubscriberCount.delete(topic)
      }

      return source.return?.() ?? Promise.resolve({ done: true, value: undefined })
    },

    async throw(error) {
      return Promise.reject(error)
    },

    [Symbol.asyncIterator]() {
      return this
    },
  }

  return manageIterator
}
