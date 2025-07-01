import { pubSub } from '@/helper/pubsub'
import type { Device, DevicePosition } from '@/object/device.object'
import axios, { type AxiosInstance } from 'axios'
import { inject, injectable } from 'tsyringe'
import WebSocket from 'ws'
import { BusService } from './bus.service'

interface TraccarWebSocketMessage {
  positions: DevicePosition[]
  devices: Device[]
  events: any[]
}

interface DeviceMap {
  [key: number]: Device
}

@injectable()
export class TraccarService {
  private axiosInstance: AxiosInstance
  private sessionCookie: string | null = null
  private ws?: WebSocket

  constructor(
    @inject(BusService)
    private readonly busService: BusService,
  ) {
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

  private async handlePositionsUpdate(message: TraccarWebSocketMessage): Promise<void> {
    const devices = await this.busService.getBusDevices()

    const deviceMap = devices.reduce<DeviceMap>((map, device) => {
      map[device.id] = device

      return map
    }, {})

    const devicePositions: DevicePosition[] = []

    for (const position of message.positions) {
      const matchDevice = deviceMap[position.deviceId!]
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
      devicePositions.push(devicePosition)
    }
    await this.busService.addBusLocations(devicePositions)
    pubSub.publish(`POSITION_UPDATE`, devicePositions)
  }

  private async handleDeviceUpdate(message: TraccarWebSocketMessage): Promise<void> {
    const { devices } = message

    await this.busService.addBus(devices)

    pubSub.publish(`DEVICE_UPDATE`, devices)
    console.log(`Device: ${devices}`)
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
    this.ws = ws
    ws.on('open', () => {
      console.log('WebSocket connection established')
    })
    ws.on('message', data => {
      const message = JSON.parse(data.toString())
      if (message.devices) {
        this.handleDeviceUpdate(message)
      } else if (message.positions) {
        this.handlePositionsUpdate(message)
      } else {
        return
      }
    })
    ws.on('error', error => {
      console.error('WebSocket error:', error)
    })
  }

  async stopWebSocket(): Promise<void> {
    if (!this.ws) {
      console.log('[TraccarService] WebSocket instance does not exist, nothing to stop.')

      return
    }

    if (this.ws.readyState === WebSocket.OPEN) {
      console.log('[TraccarService] WebSocket connection is OPEN. Closing now...')
      this.ws.close()
    } else {
      console.log(
        `[TraccarService] WebSocket is not in OPEN state (current state: ${this.ws.readyState}). No action needed.`,
      )
    }

    this.ws.removeAllListeners()

    this.ws = undefined
  }
}
