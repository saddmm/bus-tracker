import { Field, Int, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm'
import { Bus } from './bus.entity'
import { RouteStop } from './route-stop.entity'

@ObjectType()
@Entity('routes')
export class Route extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Field(() => String)
  @Column({ type: 'varchar', unique: true })
  name!: string

  @Field(() => String)
  @Column({ type: 'text', nullable: true })
  polyline!: string

  @Field(() => [Int])
  @Column({ type: 'json', nullable: true })
  operation_day!: number[]

  @Field(() => String)
  @Column({ type: 'time' })
  start_hour!: string

  @Field(() => String)
  @Column({ type: 'time' })
  end_hour!: string

  @Field(() => [Bus], { nullable: true })
  @OneToMany(() => Bus, bus => bus.route)
  buses?: Relation<Bus[]>

  @Field(() => [RouteStop], { nullable: true })
  @OneToMany(() => RouteStop, routeStops => routeStops.route)
  routeStops?: Relation<RouteStop[]>
}
