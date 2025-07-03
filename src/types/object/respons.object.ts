import { Stop } from '@/database/entities/stop.entity'
import type { ClassType } from 'type-graphql'
import { Field, ObjectType } from 'type-graphql'

export function ActionResponse<TItem extends object>(TItemClass: ClassType<TItem>) {
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

export function ActionResponseList<TItem extends object>(TItemClass: ClassType<TItem>) {
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
export class StopResponse extends ActionResponse(Stop) {}

@ObjectType()
export class StopResponses extends ActionResponseList(Stop) {}
