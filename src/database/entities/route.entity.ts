import { Field, ObjectType } from 'type-graphql'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm'
import { LocationEntity } from './location.entity'
import { Bus } from './bus.entity'
import { Stop } from './stop.entity'

@ObjectType()
@Entity('routes')
export class Route {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Field(() => String)
  @Column({ type: 'varchar', unique: true })
  name!: string

  @Field(() => String)
  @Column({ type: 'text', nullable: true })
  polyline!: string

  @Field(() => LocationEntity)
  @ManyToOne(() => LocationEntity)
  origin!: Relation<LocationEntity>

  @Field(() => LocationEntity)
  @ManyToOne(() => LocationEntity)
  destination!: Relation<LocationEntity>

  @Field(() => [Bus], { nullable: true })
  @OneToMany(() => Bus, bus => bus.route)
  buses?: Relation<Bus[]>

  @Field(() => [Stop], { nullable: true })
  @ManyToMany(() => Stop, stop => stop.routes)
  @JoinTable()
  stops?: Relation<Stop[]>
}
