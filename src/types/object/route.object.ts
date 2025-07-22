import { Field, Float, Int, ObjectType } from 'type-graphql'
import { LatLong } from './latlong.object'

@ObjectType()
export class RouteWithStop {
  @Field(() => String, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  polyline?: string

  @Field(() => [Int], { nullable: true })
  operation_day?: number[]

  @Field(() => String, { nullable: true })
  start_hour?: string

  @Field(() => String, { nullable: true })
  end_hour?: string

  @Field(() => [stopRoute], { nullable: true })
  stops?: stopRoute[]
}

@ObjectType()
class stopRoute {
  @Field(() => String, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => LatLong, { nullable: true })
  location?: LatLong

  @Field(() => Float, { nullable: true })
  sequence?: number
}
