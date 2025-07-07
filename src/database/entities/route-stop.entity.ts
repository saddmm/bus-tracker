import { Field, ID, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Route } from './route.entity'
import { Stop } from './stop.entity'

@ObjectType()
@Entity('route_stop')
export class RouteStop extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => Int)
  @Column({ type: 'int' })
  sequence!: number

  @Field(() => Route)
  @ManyToOne(() => Route, route => route.routeStops)
  route!: Route

  @Field(() => Stop)
  @ManyToOne(() => Stop, stop => stop.routeStops)
  stop!: Stop
}
