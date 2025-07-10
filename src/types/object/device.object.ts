import { Field, Float, Int, ObjectType } from 'type-graphql'

@ObjectType()
export class Device {
  @Field(() => Float, { nullable: true })
  id!: number

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  uniqueId?: string

  @Field(() => String, { nullable: true })
  routeId?: string

  @Field(() => Int, { nullable: true })
  capacity?: number

  // @Field(() => String)
  // status?: string

  // @Field(() => String)
  // lastUpdate?: Date
  @Field(() => String, { nullable: true })
  category?: string

  @Field(() => DevicePosition)
  position?: DevicePosition
}

@ObjectType()
export class DevicePosition {
  @Field(() => Float)
  id?: number

  @Field(() => Float)
  deviceId?: number

  @Field(() => Float)
  latitude?: number

  @Field(() => Float)
  longitude?: number

  @Field(() => Float)
  speed?: number

  @Field(() => String)
  serverTime?: Date

  @Field(() => String)
  timestamp?: string
}

@ObjectType()
export class DeviceParams {
  @Field(() => String)
  name!: string

  @Field(() => String)
  uniqueId!: string

  @Field(() => String)
  category!: string
}
