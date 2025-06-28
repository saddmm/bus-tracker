import { Kafka } from 'kafkajs'
import 'dotenv/config'

export const kafka = new Kafka({
  clientId: 'bus-track',
  brokers: [process.env.BROKERS!],
})
