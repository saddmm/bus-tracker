import { Field, Float, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Route } from './route.entity'

@ObjectType()
@Entity('buses')
export class Bus extends BaseEntity {
  @Field(() => Float, { nullable: true })
  @PrimaryColumn({ type: 'int', unique: true })
  id!: number

  @Field(() => String)
  @Column({ type: 'varchar', unique: true })
  name!: string

  @Field(() => String)
  @Column({ type: 'varchar', unique: true })
  uniqueId!: string

  @Field(() => String)
  @Column({ type: 'varchar', nullable: true })
  type!: string

  @Field(() => Route)
  @ManyToOne(() => Route, route => route.buses)
  route!: Route

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', default: 30 })
  capacity!: number

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  isActive!: boolean
}
