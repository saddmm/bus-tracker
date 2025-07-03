import { ArgsType, Field, Float, InputType } from 'type-graphql'

@ArgsType()
export class RouteParams {
  @Field(() => String, { nullable: true })
  startLocation?: string

  @Field(() => String, { nullable: true })
  endLocation?: string

  @Field(() => LongLatInput)
  startPoint!: LongLatInput

  @Field(() => LongLatInput)
  endPoint!: LongLatInput
}

@InputType()
export class LongLatInput {
  @Field(() => Float, { nullable: true })
  longitude?: number

  @Field(() => Float, { nullable: true })
  latitude?: number
}
