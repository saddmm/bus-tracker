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
import { LocationEntity } from './location.entity'
import { Bus } from './bus.entity'
import { Route } from './route.entity'

@ObjectType()
@Entity('stops')
export class Stop extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Field(() => String)
  @Column({ type: 'varchar', unique: true })
  name!: string

  @Field(() => LocationEntity)
  @ManyToOne(() => LocationEntity)
  location!: Relation<LocationEntity>

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @Field(() => [Bus], { nullable: true })
  @ManyToMany(() => Bus, bus => bus.stops)
  @JoinTable()
  buses?: Relation<Bus[]>

  @Field(() => [Route], { nullable: true })
  @ManyToMany(() => Route, route => route.stops)
  @JoinTable()
  routes?: Relation<Route[]>
}
