import { Kafka } from 'kafkajs'
import 'dotenv/config'

export const kafka = new Kafka({
  clientId: 'bus-track',
  brokers: ['localhost:9094'],
})
