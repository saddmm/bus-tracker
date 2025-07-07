import { ArgsType, Field, Float, InputType, Int } from 'type-graphql'

@ArgsType()
export class CreateRouteParams {
  @Field(() => String)
  name!: string

  @Field(() => [StopInput], { nullable: true })
  stops?: StopInput[]
}

@ArgsType()
export class UpdateRouteParams {
  @Field(() => String)
  id!: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [StopInput], { nullable: true })
  stops?: StopInput[]
}

@InputType()
export class LongLatInput {
  @Field(() => Float, { nullable: true })
  longitude?: number

  @Field(() => Float, { nullable: true })
  latitude?: number
}

@InputType()
export class StopInput {
  @Field(() => String)
  id!: string

  @Field(() => Int, { nullable: true })
  sequence?: number
}
