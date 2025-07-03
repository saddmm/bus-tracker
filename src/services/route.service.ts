import type { LongLatInput } from '@/types/params/route.param'
import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { injectable } from 'tsyringe'
import 'dotenv/config'

@injectable()
export class RouteService {
  private axiosInstance: AxiosInstance
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.GRAPHHOPPER_HOST,
    })
  }

  async createPolyline(origin: LongLatInput, destination: LongLatInput) {
    const originArr = Object.values(origin)
    const destinationArr = Object.values(destination)
    const response = await this.axiosInstance.post('/route', {
      points: [originArr, destinationArr],
      profile: 'car',
      locale: 'id',
      calc_points: true,
      points_encoded: true,
    })

    const polyline = response.data.paths[0].points

    return polyline
  }
}
