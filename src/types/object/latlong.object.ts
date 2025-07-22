import { Field, Float, ObjectType } from 'type-graphql'

@ObjectType()
export class LatLong {
  @Field(() => Float)
  lat!: number

  @Field(() => Float)
  lng!: number
}
