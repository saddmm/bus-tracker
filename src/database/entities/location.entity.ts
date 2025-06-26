import { Field, Float, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity('locations')
export class LocationEntity extends BaseEntity {
  @Field(() => Float)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @Column({ type: 'varchar', unique: true })
  name!: string

  @Field(() => Float)
  @Column('float')
  latitude!: number

  @Field(() => Float)
  @Column('float')
  longitude!: number
}
