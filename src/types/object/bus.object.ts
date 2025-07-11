import { Field, ObjectType } from 'type-graphql'
import { Device } from './device.object'
import { StopEta } from './stop.object'

@ObjectType()
export class BusWithEtaStop extends Device {
  @Field(() => [StopEta])
  stops?: StopEta[]
}
