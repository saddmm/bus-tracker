import { ArgsType, Field, Int, ObjectType } from 'type-graphql'

@ArgsType()
@ObjectType()
export class BusParams {
  @Field(() => String, { nullable: true })
  name!: string

  @Field(() => String, { nullable: true })
  uniqueId!: string

  @Field(() => Int, { nullable: true })
  capacity?: number

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  routeId?: string
}
