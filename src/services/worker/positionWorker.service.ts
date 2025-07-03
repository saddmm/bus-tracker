import type { Consumer, EachMessagePayload } from 'kafkajs'
import { inject, injectable } from 'tsyringe'
import { BusService } from '../bus.service'
import type { DevicePosition } from '@/types/object/device.object'
import { pubSub } from '@/helper/pubsub'

@injectable()
export class PositionWorkerService {
  constructor(
    @inject('KafkaConsumer')
    private readonly consumer: Consumer,

    @inject(BusService)
    private readonly busService: BusService,
  ) {}

  async start(): Promise<void> {
    await this.consumer.subscribe({
      topic: 'POSITION_UPDATE',
      fromBeginning: true,
    })

    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        if (!message.value) return

        const position: DevicePosition = JSON.parse(message.value.toString())

        const devices = await this.busService.getBusDevices()

        const matchDevice = devices.find(device => device.id === position.deviceId)

        const devicePosition = {
          id: matchDevice?.id || position.deviceId,
          name: matchDevice?.name || '',
          uniqueId: matchDevice?.uniqueId || '',
          status: matchDevice?.status || '',
          lastUpdate: matchDevice?.lastUpdate || new Date(),
          category: matchDevice?.category || '',
          position: {
            ...position,
            timestamp: new Date().toISOString(),
          },
        }

        await this.busService.addBusLocations([devicePosition])
        pubSub.publish(`POSITION_UPDATE`, [devicePosition])
      },
    })
  }
}
