import { LocationObject } from '@/object/location.object'
import { TraccarService } from '@/services/traccar.service'
import { inject, injectable } from 'tsyringe'
import { Query, Resolver } from 'type-graphql'

@injectable()
@Resolver(LocationObject)
export class LocationResolver {
  constructor(
    @inject(TraccarService)
    private readonly traccarService: TraccarService,
  ) {}

  @Query(() => [LocationObject])
  async locations(): Promise<void> {
    await this.traccarService.connectToWebSocket()
  }
}
