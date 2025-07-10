import { injectable } from 'tsyringe'
import 'dotenv/config'
import type { AxiosInstance } from 'axios'
import axios from 'axios'

@injectable()
export class MapsService {
  private axiosInstance: AxiosInstance
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.GRAPHHOPPER_HOST,
      params: {
        key: process.env.API_KEY_GRAPHHOPPER,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async createPolyline(locations: number[][]) {
    try {
      const response = await this.axiosInstance.post('/route', {
        points: locations,
        profile: 'car',
        locale: 'id',
        calc_points: true,
        points_encoded: true,
      })

      const polyline = response.data.paths[0].points

      return polyline
    } catch (err: any) {
      throw new Error(err)
    }
  }

  async distanceMatrix(from_points: number[][], to_points: number[][]) {
    const result = await this.axiosInstance.post('matrix', {
      from_points: from_points,
      to_points: to_points,
      vehicle: 'car',
    })

    return result.data
  }
}
