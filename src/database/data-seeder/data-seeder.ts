import { AppDataSource } from '../data-source'
import { Stop } from '../entities/stop.entity'

const stopsSeeder = [
  {
    name: 'Halte Terminal Porong',
    location: {
      latitude: -7.538187253606434,
      longitude: 112.69586123896379,
    },
  },
  {
    name: 'Halte Gedang',
    location: {
      latitude: -7.534821268601081,
      longitude: 112.7009943812925,
    },
  },
  {
    name: 'Halte Tanggulangin',
    location: {
      latitude: -7.506817796909948,
      longitude: 112.70835061396555,
    },
  },
  {
    name: 'Halte Keramean',
    location: {
      latitude: -7.492142384978424,
      longitude: 112.71088839478483,
    },
  },
  {
    name: 'Halte Terminal Larangan',
    location: {
      latitude: -7.466487921678383,
      longitude: 112.71220566779868,
    },
  },
  {
    name: 'Halte Lemahputro',
    location: {
      latitude: -7.4522864665767115,
      longitude: 112.71496225430549,
    },
  },
  {
    name: 'Halte Alun - Alun Sidoarjo 1',
    location: {
      latitude: -7.446935079124618,
      longitude: 112.71756969663404,
    },
  },
  {
    name: 'Halte Sun City 1',
    location: {
      latitude: -7.449851327189758,
      longitude: 112.71033949663396,
    },
  },
  {
    name: 'Halte Pondok Mutiara',
    location: {
      latitude: -7.44830467537489,
      longitude: 112.70236262169163,
    },
  },
]

const seed = async () => {
  await AppDataSource.initialize()

  await Stop.save(stopsSeeder)
  console.log(`Data berhasil di tambah`)

  await AppDataSource.destroy()
}

seed()
