import { Field, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm'
import { LongLat } from '../../types/object/longlat.object'
import { RouteStop } from './route-stop.entity'

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

  @Field(() => [RouteStop], { nullable: true })
  @OneToMany(() => RouteStop, routeStops => routeStops.stop)
  routeStops?: Relation<RouteStop[]>
}
