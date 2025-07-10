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

  async addBus(device: Device): Promise<void> {
    this.redisService.set('device', device)
  }

  async getBusDevices(): Promise<Device[]> {
    const result = await this.redisService.getAll('device')

    return result || []
  }

  async getBus(id: string): Promise<Device> {
    const result = await this.redisService.get('device', id)

    return result
  }

  async getBusLocations(): Promise<DevicePosition[]> {
    const result = await this.redisService.getAll('position')

    return result || []
  }

  async getBusLocationById(id: string): Promise<DevicePosition | null> {
    const result = await this.redisService.get('position', id)

    return result || null
  }
}
