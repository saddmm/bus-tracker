import { Stop } from '@/database/entities/stop.entity'
import { Field, ObjectType } from 'type-graphql'

enum STATUS_STOP {
  UPCOMING = 'upcoming',
  PASSED = 'passed',
}

@ObjectType()
export class StopEta extends Stop {
  @Field(() => String, { nullable: true })
  status?: STATUS_STOP

  @Field(() => String, { nullable: true })
  eta?: string

  @Field(() => String, { nullable: true })
  distance?: string
}
