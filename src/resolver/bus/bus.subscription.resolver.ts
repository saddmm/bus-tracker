// import { manageAsyncIterator } from '@/helper/manageAsyncIterator'
import { Device } from '@/types/object/device.object'
import { DevicePosition } from '@/types/object/device.object'
import { injectable } from 'tsyringe'
import { Resolver, Root, Subscription } from 'type-graphql'

@injectable()
@Resolver(DevicePosition)
export class LocationResolver {
  constructor() {}

  @Subscription(() => [Device], {
    topics: 'POSITION_UPDATE',
  })
  positionUpdate(@Root() devices: Device[]): Device[] {
    return devices
  }
}
