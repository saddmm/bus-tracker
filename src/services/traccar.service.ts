import { redis } from '@/config/redis'
import { pubSub } from '@/helper/schema'
import type { Device, DevicePosition } from '@/object/device.object'
import axios, { type AxiosInstance } from 'axios'
import { injectable } from 'tsyringe'
import WebSocket from 'ws'

interface TraccarWebSocketMessage {
  positions: DevicePosition[]
  devices: Device[]
  events: any[]
}

@injectable()
export class TraccarService {
  private axiosInstance: AxiosInstance
  private sessionCookie: string | null = null

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `http://${process.env.TRACCAR_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  private async authenticate(): Promise<void> {
    if (this.sessionCookie) {
      return
    }
    const params = new URLSearchParams()
    params.append('email', process.env.TRACCAR_EMAIL!)
    params.append('password', process.env.TRACCAR_PASSWORD!)
    console.log(params)

    const response = await this.axiosInstance.post('/session', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const cookie = response.headers['set-cookie']?.[0]
    if (cookie) {
      this.sessionCookie = cookie
      this.axiosInstance.defaults.headers.common.Cookie = this.sessionCookie
    } else {
      throw new Error('Failed to retrieve session cookie')
    }
  }

  private async handleWebSocketMessage(message: TraccarWebSocketMessage): Promise<void> {
    // const deviceMap = message.devices.reduce<DeviceMap>((map, device) => {
    //   map[device.id] = device

    //   return map
    // }, {})

    // const devicePositions: DevicePosition[] = []
    // for (const position of message.positions) {
    //   const matchDevice = deviceMap[position.deviceId]
    //   const devicePosition = {
    //     id: matchDevice!.id,
    //     deviceId: position.deviceId,
    //     name: matchDevice?.name,
    //     uniqueId: matchDevice?.uniqueId,
    //     latitude: position.latitude,
    //     longitude: position.longitude,
    //     speed: position.speed,
    //     serverTime: position.serverTime,
    //     timestamp: new Date().toISOString(),
    //   }
    //   devicePositions.push(devicePosition)
    // }
    const devicePositions = message.positions
    const multi = redis.multi()
    devicePositions.forEach(item => {
      const key = `position:${item.deviceId}`

      multi.HSET(key, item as any)
      multi.sAdd(`positions:all`, item.deviceId.toString())
    })
    await multi.exec()
    pubSub.publish(`POSITION_UPDATE`, devicePositions)

    console.log(`atas: ${devicePositions}`)
    console.log(`Position update: ${devicePositions}`)
  }

  private async handleDeviceUpdate(message: TraccarWebSocketMessage): Promise<void> {
    const { devices } = message

    // const positionsMap = new Map(positions.map(pos => [pos.deviceId, pos]))

    // devices.forEach(device => {
    //   const positionData = positionsMap.get(device.id)
    //   if (positionData) {
    //     device.position = positionData
    //   }
    // })
    pubSub.publish(`DEVICE_UPDATE`, devices)
    console.log(`Device: ${devices}`)
    console.log(`Tidak ada positions`)
  }

  async connectToWebSocket(): Promise<void> {
    await this.authenticate()

    if (!this.sessionCookie) {
      throw new Error('Session cookie is not set. Authentication failed.')
    }

    const wsUrl = `ws://${process.env.TRACCAR_BASE_URL}/api/socket`
    const ws = new WebSocket(wsUrl, {
      headers: {
        Cookie: this.sessionCookie || '',
      },
    })
    ws.on('open', () => {
      console.log('WebSocket connection established')
    })
    ws.on('message', data => {
      const message = JSON.parse(data.toString())
      this.handleWebSocketMessage(message)
      this.handleDeviceUpdate(message)
      console.log('Received data:', message)
    })
  }
}
