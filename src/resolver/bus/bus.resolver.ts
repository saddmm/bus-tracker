import { Bus } from '@/database/entities/bus.entity'
import type { TraccarService } from '@/services/traccar.service'
import { injectable } from 'tsyringe'
import { Query, Resolver } from 'type-graphql'

@injectable()
@Resolver(() => Bus)
export class BusResolver {
  constructor(private readonly traccarService: TraccarService) {}

  @Query(() => [Bus])
  async buses(): Promise<Bus[]> {
    return Bus.find()
  }
}
