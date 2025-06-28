import { Device } from '@/object/device.object'
import { DevicePosition } from '@/object/device.object'
import { TraccarService } from '@/services/traccar.service'
import { inject, injectable } from 'tsyringe'
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
    topics: 'DEVICE_UPDATE',
  })
  positionUpdate(@Root() device: Device[]): Device[] {
    console.log(device)

    return device
  }
}
