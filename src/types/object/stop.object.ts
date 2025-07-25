import { Stop } from '@/database/entities/stop.entity'
import { Field, Float, ObjectType } from 'type-graphql'

enum STATUS_STOP {
  UPCOMING = 'upcoming',
  PASSED = 'passed',
  SKIPPED = 'skipped',
}

@ObjectType()
export class StopEta extends Stop {
  @Field(() => String, { nullable: true })
  status?: STATUS_STOP

  @Field(() => String, { nullable: true })
  distanceText?: string

  @Field(() => String, { nullable: true })
  etaText?: string

  @Field(() => Float, { nullable: true })
  distance?: number

  @Field(() => Float, { nullable: true })
  eta?: number
}
