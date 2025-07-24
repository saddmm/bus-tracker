import { inject, injectable } from 'tsyringe'
import { RedisService } from '../redis.service'
import { StopService } from '../stop.service'
import { redis } from '@/config/redis'
import type { Device } from '@/types/object/device.object'
import { MapsService } from '../maps.service'
import type { RouteWithStop } from '@/types/object/route.object'
import { pubSub } from '@/helper/pubsub'
import type { LatLong } from '@/types/object/latlong.object'

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

  async processCalculation() {
    const ACTIVE_BUSES_KEY: string = 'worker:active_buses'
    const ACTIVE_STOP_KEY: string = 'worker:active_stops'
    const activeBuses = await redis.sMembers(ACTIVE_BUSES_KEY)
    const activeStops = await redis.sMembers(ACTIVE_STOP_KEY)

    if (activeBuses.length === 0 && activeStops.length === 0) {
      return
    }

    for (const busId of activeBuses) {
      const bus: Device = await this.redisService.get('position', busId)
      const from_points: LatLong[] = [
        {
          lat: Number(bus.position!.latitude),
          lng: Number(bus.position!.longitude),
        },
      ]

      // Step 1: 📥 Ambil Data Stops dari Redis busToStop
      let stopList = []
      try {
        const buss = await this.redisService.get('bus_to_stop', busId)
        stopList = buss.stops || []
        console.log(`Found existing stops data for bus ${busId}: ${stopList.length} stops`)
      } catch {
        console.log(`No existing busToStop data for bus ${busId}`)
      }

      // Step 2: 🔍 Jika TIDAK ADA → Ambil dari Routes (semua status = "upcoming")
      if (stopList.length === 0) {
        const route: RouteWithStop = await this.redisService.get('route', bus.routeId!)
        if (!route.stops || route.stops.length === 0) {
          console.log('No stops found for route:', bus.routeId)
          continue
        }

        stopList = route.stops
          .filter(stop => stop.sequence !== undefined)
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
          .map(stop => ({
            ...stop,
            status: 'upcoming',
            distance: 'N/A',
            eta: 'N/A',
            distanceValue: 0,
          }))

        console.log(`Initialized ${stopList.length} stops as 'upcoming' for bus ${busId}`)
      }

      // Step 3: 🎯 Filter 5 Halte dengan Status "upcoming"
      const upcomingStops = stopList.filter((stop: any) => stop.status === 'upcoming').slice(0, 5)

      if (upcomingStops.length === 0) {
        console.log('No upcoming stops found for bus:', busId)
        // Still publish existing data if available
        const existingBusToStop = { ...bus, stops: stopList }
        pubSub.publish(`BUS_TO_STOP_${busId}`, existingBusToStop)
        continue
      }

      // Step 4: 🗺️ Kirim ke Google Maps API (hanya 5 halte upcoming)
      const to_points = upcomingStops.map((stop: any) => ({
        lat: stop.location?.lat || 0,
        lng: stop.location?.lng || 0,
      }))

      console.log(`Processing ${upcomingStops.length} upcoming stops for bus ${busId}`)

      try {
        const result = await this.mapsService.distanceMatrix(from_points, to_points)

        // Step 5: 📊 Update Status berdasarkan jarak
        const updatedStopList = stopList.map((stop: any) => {
          // Find if this stop is in upcoming stops that were processed
          const upcomingIndex = upcomingStops.findIndex((us: any) => us.id === stop.id)

          if (upcomingIndex !== -1) {
            // This stop was processed with Google Maps API
            const element = result.rows[0]?.elements[upcomingIndex]
            const distanceValue = element?.distance?.value || 0
            const distanceText = element?.distance?.text || 'N/A'
            const etaText = element?.duration?.text || 'N/A'

            // Get current status or default to upcoming
            const currentStatus = stop.status || 'upcoming'
            let newStatus = currentStatus

            // Status transition logic
            if (currentStatus === 'upcoming' && distanceValue < 50) {
              newStatus = 'passed'
              console.log(
                `Bus ${busId} is now at stop ${stop.name} (${distanceValue}m) - Status: upcoming → passed`,
              )
            } else if (currentStatus === 'passed' && distanceValue > 100) {
              newStatus = 'skipped'
              console.log(
                `Bus ${busId} has left stop ${stop.name} (${distanceValue}m) - Status: passed → skipped`,
              )
            }

            return {
              ...stop,
              status: newStatus,
              distance: distanceText,
              eta: newStatus === 'skipped' ? 'Skipped' : etaText,
              distanceValue: distanceValue,
            }
          } else {
            // This stop was not processed, keep existing data
            return {
              ...stop,
              status: stop.status || 'upcoming',
              distance: stop.distance || 'N/A',
              eta: stop.eta || 'N/A',
              distanceValue: stop.distanceValue || 0,
            }
          }
        })

        // Step 6: 💾 Simpan ke Redis & Publish
        const busToStop = {
          ...bus,
          stops: updatedStopList,
        }

        await this.redisService.set('bus_to_stop', busToStop)
        pubSub.publish(`BUS_TO_STOP_${busId}`, busToStop)
        console.log(`ETA calculated successfully for bus ${busId}`)
      } catch (error) {
        console.error(`Failed to calculate ETA for bus ${busId}:`, error)
        continue
      }
    }
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
