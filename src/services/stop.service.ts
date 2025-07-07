import { Stop } from '@/database/entities/stop.entity'
import type { StopInput } from '@/types/params/route.param'
import { injectable } from 'tsyringe'
import { In } from 'typeorm'

interface ProcessedStop {
  stopId: string
  sequence: number
}

@injectable()
export class StopService {
  async stopSequence(stops: StopInput[]) {
    const isSequenceProvided = stops.length > 0 && stops[0]?.sequence != null

    let processedStops: ProcessedStop[]

    if (isSequenceProvided) {
      processedStops = stops.map(stop => ({
        stopId: stop.id,
        sequence: stop.sequence!,
      }))

      processedStops.sort((a, b) => a.sequence - b.sequence)
    } else {
      processedStops = stops.map((stop, index) => ({
        stopId: stop.id,
        sequence: index + 1,
      }))
    }

    return processedStops
  }

  async findStopsInOrder(stopIds: string[]) {
    if (!stopIds || stopIds.length === 0) {
      return []
    }

    const unorderedStops = await Stop.find({
      where: {
        id: In(stopIds),
      },
    })

    const stopsMap = new Map<string, Stop>()
    for (const stop of unorderedStops) {
      stopsMap.set(stop.id, stop)
    }

    const orderedStops = stopIds
      .map(id => stopsMap.get(id))
      .filter(stop => stop !== undefined) as Stop[]

    return orderedStops
  }
}
