import { Field, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm'
import { Bus } from './bus.entity'
import { LongLat, Route } from './route.entity'

@ObjectType()
@Entity('stops')
export class Stop extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Field(() => String)
  @Column({ type: 'varchar', unique: true })
  name!: string

  @Field(() => LongLat)
  @Column({ type: 'json' })
  location!: LongLat

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @Field(() => [Bus], { nullable: true })
  @ManyToMany(() => Bus, bus => bus.stops)
  @JoinTable()
  buses?: Relation<Bus[]>

  @Field(() => Route, { nullable: true })
  @ManyToOne(() => Route, route => route.stops)
  route?: Relation<Route>
}
