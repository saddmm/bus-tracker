import { Bus } from '@/database/entities/bus.entity'
import { Stop } from '@/database/entities/stop.entity'
import type { ClassType } from 'type-graphql'
import { Field, ObjectType } from 'type-graphql'

export function FormatResponse<TItem extends object>(TItemClass: ClassType<TItem>) {
  @ObjectType()
  abstract class ActionResponseClass {
    @Field(() => Boolean)
    success!: boolean

    @Field(() => String)
    msg!: string

    @Field(() => TItemClass, { nullable: true })
    data?: TItem
  }

  return ActionResponseClass
}

export function FormatResponseList<TItem extends object>(TItemClass: ClassType<TItem>) {
  @ObjectType()
  abstract class ActionResponseClass {
    @Field(() => Boolean)
    success!: boolean

    @Field(() => String)
    msg!: string

    @Field(() => [TItemClass], { nullable: true })
    data?: TItem[]
  }

  return ActionResponseClass
}

@ObjectType()
export class StopResponse extends FormatResponse(Stop) {}

@ObjectType()
export class StopResponses extends FormatResponseList(Stop) {}

@ObjectType()
export class BusResponse extends FormatResponse(Bus) {}

@ObjectType()
export class ActionRespons {
  @Field(() => Boolean)
  success!: boolean

  @Field(() => String)
  msg!: string

  @Field(() => String, { nullable: true })
  data?: string | Array<object> | object
}
