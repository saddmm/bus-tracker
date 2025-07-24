import { injectable } from 'tsyringe'
import 'dotenv/config'
import { Client, TravelMode } from '@googlemaps/google-maps-services-js'
import type { LatLong } from '@/types/object/latlong.object'

@injectable()
export class MapsService {
  private googleMapsClient: Client

  constructor() {
    this.googleMapsClient = new Client({})
  }

  async getPolyline(waypoints: LatLong[]): Promise<string> {
    const response = await this.googleMapsClient.directions({
      params: {
        origin: waypoints[0]!,
        destination: waypoints[waypoints.length - 1]!,
        waypoints: waypoints.slice(1, -1),
        key: process.env.API_KEY_GOOGLE_MAPS!,
      },
    })

    console.log(JSON.stringify(waypoints))
    console.log('response', response.data.routes[0]?.overview_polyline.points)
    const polyline = response.data.routes[0]?.overview_polyline.points
    if (!polyline) {
      throw new Error('Polyline not found in the response')
    }

    return polyline
  }

  async distanceMatrix(from_points: LatLong[], to_points: LatLong[]) {
    const response = await this.googleMapsClient.distancematrix({
      params: {
        origins: from_points,
        destinations: to_points,
        key: process.env.API_KEY_GOOGLE_MAPS!,
        mode: TravelMode.driving,
        departure_time: Date.now(),
      },
    })

    return response.data
  }
}
