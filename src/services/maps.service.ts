import { injectable } from 'tsyringe'
import 'dotenv/config'
import type { AxiosInstance } from 'axios'
import axios from 'axios'
import type { Client } from '@googlemaps/google-maps-services-js'

@injectable()
export class MapsService {
  private graphHopperInstance: AxiosInstance
  private googleMapsClient: Client
  constructor() {
    this.graphHopperInstance = axios.create({
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
      const response = await this.graphHopperInstance.post('/route', {
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

  async getPolyline(locations: ) {
    const response = await this.googleMapsClient.directions({

    })
  }
}
