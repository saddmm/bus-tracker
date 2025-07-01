import type { TraccarService } from '@/services/traccar.service'
import type { PubSub } from 'graphql-yoga'

export interface MyContext {
  pubSub: PubSub<Record<string, any>>
  traccarService: TraccarService
  // Add other properties as needed
}
