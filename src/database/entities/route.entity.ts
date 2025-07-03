import { Field, Float, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm'
import { Bus } from './bus.entity'
import { Stop } from './stop.entity'

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

  @Field(() => LongLat)
  @Column({ type: 'json' })
  origin!: LongLat

  @Field(() => LongLat)
  @Column({ type: 'json' })
  destination!: LongLat

  @Field(() => [Bus], { nullable: true })
  @OneToMany(() => Bus, bus => bus.route)
  buses?: Relation<Bus[]>

  @Field(() => [Stop], { nullable: true })
  @OneToMany(() => Stop, stop => stop.route)
  stops?: Relation<Stop[]>
}

@ObjectType()
export class LongLat {
  @Field(() => Float)
  longitude?: number

  @Field(() => Float)
  latitude?: number
}
