import { manageAsyncIterator } from '@/helper/manageAsyncIterator'
import { Device } from '@/object/device.object'
import { DevicePosition } from '@/object/device.object'
import { TraccarService } from '@/services/traccar.service'
import { container, inject, injectable } from 'tsyringe'
import { Query, Resolver, Root, Subscription } from 'type-graphql'

@injectable()
@Resolver(DevicePosition)
export class LocationResolver {
  constructor(
    @inject(TraccarService)
    private readonly traccarService: TraccarService,
  ) {}

  @Query(() => [DevicePosition])
  async locations(): Promise<void> {
    await this.traccarService.connectToWebSocket()
  }

  @Subscription(() => [Device], {
    subscribe: () => {
      const traccarService = container.resolve(TraccarService)

      return manageAsyncIterator<Device[]>('POSITION_UPDATE', {
        onStart: async () => {
          await traccarService.connectToWebSocket()
        },
        onStop: async () => {
          await traccarService.stopWebSocket()
          console.log('Stopping position updates subscription')
        },
      })
    },
  })
  positionUpdate(@Root() devices: Device[]): Device[] {
    console.log('Managed position update:', devices)

    return devices
  }
}
