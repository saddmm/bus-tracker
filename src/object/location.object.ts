import { Field, Float, ObjectType } from 'type-graphql'

@ObjectType()
export class LocationObject {
  @Field(() => String)
  id!: string

  @Field(() => Float)
  latitude!: number

  @Field(() => Float)
  longitude!: number
}
