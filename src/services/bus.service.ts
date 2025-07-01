import { redis } from '@/config/redis'
import type { Device, DevicePosition } from '@/object/device.object'

export class BusService {
  constructor() {}

  async addBusLocations(positions: DevicePosition[]) {
    const multi = redis.multi()
    positions.forEach(item => {
      const key = `position:${item.id}`
      multi.SET(key, JSON.stringify(item))
      multi.SADD(`positions:all`, item.id!.toString())
    })
    await multi.exec()
  }

  async addBus(devices: Device[]) {
    const multi = redis.multi()
    devices.forEach(item => {
      const key = `device:${item.id}`

      multi.SET(key, JSON.stringify(item))
      multi.SADD(`devices:all`, item.id.toString())
    })
    await multi.exec()
  }
}
