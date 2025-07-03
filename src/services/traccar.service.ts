import type { Device, DevicePosition } from '@/types/object/device.object'
import axios, { type AxiosInstance } from 'axios'
import { inject, injectable } from 'tsyringe'
import WebSocket from 'ws'
import { BusService } from './bus.service'
import type { Producer } from 'kafkajs'

interface TraccarWebSocketMessage {
  positions: DevicePosition[]
  devices: Device[]
  events: any[]
}

@injectable()
export class TraccarService {
  private axiosInstance: AxiosInstance
  private sessionCookie: string | null = null
  private ws?: WebSocket

  constructor(
    @inject(BusService)
    private readonly busService: BusService,

    @inject('KafkaProducer')
    private readonly kafkaProducer: Producer,
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
    if (!message.positions) {
      console.warn('No positions found in the message')

      return
    }

    await this.kafkaProducer.connect()

    message.positions.forEach(position => {
      this.kafkaProducer
        .send({
          topic: 'POSITION_UPDATE',
          messages: [{ value: JSON.stringify(position) }],
        })
        .catch(error => {
          console.error('Error sending position to Kafka:', error)
        })
    })
  }

  private async handleDeviceUpdate(message: TraccarWebSocketMessage): Promise<void> {
    const { devices } = message

    await this.busService.addBus(devices)
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
