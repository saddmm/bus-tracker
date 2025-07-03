import { ArgsType, Field } from 'type-graphql'
import { LongLatInput } from './route.param'

@ArgsType()
export class StopParams {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => LongLatInput, { nullable: true })
  location?: LongLatInput

  @Field(() => String, { nullable: true })
  routeId?: string
}
