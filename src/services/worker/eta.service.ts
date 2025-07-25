import { inject, injectable } from 'tsyringe'
import { RedisService } from '../redis.service'
import { StopService } from '../stop.service'
import type { Device } from '@/types/object/device.object'
import { MapsService } from '../maps.service'
import type { RouteWithStop } from '@/types/object/route.object'
import { pubSub } from '@/helper/pubsub'
import type { LatLong } from '@/types/object/latlong.object'
import type { BusWithEtaStop } from '@/types/object/bus.object'
import { point, lineSlice, nearestPointOnLine, length as turfLength, lineString } from '@turf/turf'
import polyline from '@mapbox/polyline'

@injectable()
export class EtaService {
  private intervalId: NodeJS.Timeout | null = null
  constructor(
    @inject(RedisService)
    private readonly redisService: RedisService,

    @inject(StopService)
    private readonly stopService: StopService,

    @inject(MapsService)
    private readonly mapsService: MapsService,
  ) {}

  private calculateDistanceAlongRoute(routeLine: any, pointCoords: number[]): number {
    const pointToMeasure = point(pointCoords)
    const routeStartPoint = point(routeLine.geometry.coordinates[0])

    const snappedPoint = nearestPointOnLine(routeLine, pointToMeasure)

    const slicedLine = lineSlice(routeStartPoint, snappedPoint, routeLine)

    return turfLength(slicedLine, { units: 'meters' })
  }

  async processCalculation(busId: string): Promise<BusWithEtaStop | undefined> {
    // const ACTIVE_BUSES_KEY: string = 'worker:active_buses'
    // const ACTIVE_STOP_KEY: string = 'worker:active_stops'
    // const activeBuses = await redis.sMembers(ACTIVE_BUSES_KEY)
    // const activeStops = await redis.sMembers(ACTIVE_STOP_KEY)

    // if (activeBuses.length === 0 && activeStops.length === 0) {
    //   return
    // }

    // for (const busId of activeBuses) {
    const bus: Device = await this.redisService.get('position', busId)
    const route: RouteWithStop = await this.redisService.get('route', bus.routeId!)
    if (!bus || !route) {
      console.log(`No bus or route found for ID: ${busId}`)

      return
    }

    const decodedCoordinates = polyline.decode(route.polyline!)
    const routePolyline = decodedCoordinates.map(coord => [coord[1], coord[0]])
    const routeLine = lineString(routePolyline)

    const busDistanceAlongRoute = this.calculateDistanceAlongRoute(routeLine, [
      Number(bus.position!.longitude),
      Number(bus.position!.latitude),
    ])

    let stopList = []
    try {
      const buss = await this.redisService.get('bus_to_stop', busId)
      stopList = buss.stops || []
      console.log(`Found existing stops data for bus ${busId}: ${stopList.length} stops`)
    } catch {
      console.log(`No existing busToStop data for bus ${busId}`)
    }

    if (stopList.length === 0) {
      const route: RouteWithStop = await this.redisService.get('route', bus.routeId!)
      if (!route.stops || route.stops.length === 0) {
        console.log('No stops found for route:', bus.routeId)
        // continue

        return
      }

      stopList = route.stops
        .filter(stop => stop.sequence !== undefined)
        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        .map(stop => ({
          ...stop,
          status: 'upcoming',
          distanceText: 'N/A',
          etaText: 'N/A',
          distance: 0,
          eta: 0,
        }))
    }

    const upcomingStops = stopList.filter((stop: any) => stop.status === 'upcoming').slice(0, 5)

    if (upcomingStops.length === 0) {
      console.log('No upcoming stops found for bus:', busId)
      const existingBusToStop = { ...bus, stops: stopList }
      pubSub.publish(`BUS_TO_STOP_${busId}`, existingBusToStop)
      // continue

      return
    }

    const from_points: LatLong[] = [
      {
        lat: Number(bus.position!.latitude),
        lng: Number(bus.position!.longitude),
      },
    ]

    const to_points = upcomingStops.map((stop: any) => ({
      lat: stop.location?.lat || 0,
      lng: stop.location?.lng || 0,
    }))

    console.log(`Processing ${upcomingStops.length} upcoming stops for bus ${busId}`)

    try {
      const result = await this.mapsService.distanceMatrix(from_points, to_points)
      console.log(JSON.stringify(result))

      const updatedStopList = stopList.map((stop: any) => {
        const upcomingIndex = upcomingStops.findIndex((us: any) => us.id === stop.id)

        if (upcomingIndex !== -1) {
          const element = result.rows[0]?.elements[upcomingIndex]
          const distanceValue = element?.distance?.value || 0
          const distanceText = element?.distance?.text || 'N/A'
          const etaText = element?.duration_in_traffic?.text || 'N/A'
          const etaValue = element?.duration_in_traffic?.value || 0

          let newStatus = stop.status

          if (stop.status === 'upcoming') {
            const stopDistanceAlongRoute = this.calculateDistanceAlongRoute(routeLine, [
              Number(stop.location?.lng || 0),
              Number(stop.location?.lat || 0),
            ])

            if (busDistanceAlongRoute >= stopDistanceAlongRoute) {
              newStatus = 'passed'
              if (newStatus === 'passed' && distanceValue > 100) {
                newStatus = 'skipped'
              }
            }
          }

          return {
            ...stop,
            status: newStatus,
            distanceText: distanceText,
            etaText: etaText,
            distance: distanceValue,
            eta: etaValue,
          }
        } else {
          // This stop was not processed, keep existing data
          return {
            ...stop,
            status: stop.status || 'upcoming',
            distanceText: stop.distanceText || 'N/A',
            etaText: stop.etaText || 'N/A',
            distance: stop.distance || 0,
            eta: stop.eta || 0, // Ensure eta is always present
          }
        }
      })

      // Step 6: 💾 Simpan ke Redis & Publish
      const busToStop = {
        ...bus,
        stops: updatedStopList,
      }

      await this.redisService.set('bus_to_stop', busToStop)

      return busToStop
      // pubSub.publish(`BUS_TO_STOP_${busId}`, busToStop)
      // console.log(`ETA calculated successfully for bus ${busId}`)
    } catch (error) {
      console.error(`Failed to calculate ETA for bus ${busId}:`, error)
      // continue

      return
    }
    // }
  }

  startCalculation() {
    if (this.intervalId) {
      this.stopCalculation()
    }
    this.intervalId = setInterval(() => this.processCalculation(), 5000)
  }

  stopCalculation() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
