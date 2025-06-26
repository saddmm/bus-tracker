import { pubSub } from '@/helper/pubsub'
import axios, { type AxiosInstance } from 'axios'
import { injectable } from 'tsyringe'
import WebSocket from 'ws'

interface TraccarPosition {
  deviceId: number
  latitude: number
  longitude: number
  speed: number
  serverTime: number
  timestamp: Date
}

interface TraccarWebSocketMessage {
  positions: TraccarPosition[]
  devices: any[]
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
    if (message.positions.length > 0) {
      let devicePosition
      for (const position of message.positions) {
        devicePosition = {
          deviceId: position.deviceId,
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed,
          serverTime: position.serverTime,
          timestamp: new Date(),
        }
      }
      await pubSub.publish(`POSITION_UPDATE`, devicePosition)

      console.log(`Position update: ${devicePosition}`)
    }
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
      console.log('Received data:', message)
    })
  }
}
