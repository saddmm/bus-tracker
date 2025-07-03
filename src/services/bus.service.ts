import type { Device, DevicePosition } from '@/types/object/device.object'
import { inject, injectable } from 'tsyringe'
import { RedisService } from './redis.service'

@injectable()
export class BusService {
  constructor(
    @inject(RedisService)
    private readonly redisService: RedisService,
  ) {}

  async addBusLocations(positions: DevicePosition[]): Promise<void> {
    this.redisService.setAll('position', positions)
  }

  async addBus(devices: Device[]): Promise<void> {
    this.redisService.setAll('device', devices)
  }

  async getBusDevices(): Promise<Device[]> {
    const result = await this.redisService.getAll('device')
    console.log(result)

    return result || []
  }

  async getBusLocations(): Promise<DevicePosition[]> {
    const result = await this.redisService.getAll('position')

    return result || []
  }
}
