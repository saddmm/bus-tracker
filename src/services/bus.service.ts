import type { Device, DevicePosition } from '@/object/device.object'
import { inject, injectable } from 'tsyringe'
import { RedisService } from './redis.service'

@injectable()
export class BusService {
  constructor(
    @inject(RedisService)
    private readonly redisService: RedisService,
  ) {}

  async addBusLocations(positions: DevicePosition[]) {
    this.redisService.setAll('positions:all', positions)
  }

  async addBus(devices: Device[]) {
    this.redisService.setAll('devices:all', devices)
  }

  async getBusDevices() {
    await this.redisService.getAll('devices:all')
  }

  async getBusLocations() {
    await this.redisService.getAll('positions:all')
  }
}
