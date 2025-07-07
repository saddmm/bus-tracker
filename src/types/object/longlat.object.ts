import { Field, Float, ObjectType } from 'type-graphql'

@ObjectType()
export class LongLat {
  @Field(() => Float)
  longitude?: number

  @Field(() => Float)
  latitude?: number
}
