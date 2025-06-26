import { Field, Float, ObjectType } from 'type-graphql'
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
import { Route } from './route.entity'
import { Stop } from './stop.entity'

@ObjectType()
@Entity('buses')
export class Bus extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Field(() => String)
  @Column({ type: 'varchar', unique: true })
  name!: string

  @Field(() => String)
  @Column({ type: 'varchar' })
  type!: string

  @Field(() => Route)
  @ManyToOne(() => Route, route => route.buses)
  route!: Route

  @Field(() => Float)
  @Column({ type: 'float' })
  capacity!: number

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @Field(() => Stop, { nullable: true })
  @ManyToMany(() => Stop, stop => stop.buses, { nullable: true })
  @JoinTable()
  stops?: Relation<Stop[]>
}
