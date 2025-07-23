// import type { DeepPartial } from 'typeorm'
// import { AppDataSource } from '../data-source'
// import type { Stop } from '../entities/stop.entity'
// import { container } from 'tsyringe'
// import { RouteService } from '../../services/route.service'
// import { Route } from '../entities/route.entity'

// const stopsSeeder: DeepPartial<Stop[]> = [
//   {
//     id: '1',
//     name: 'Halte Terminal Porong',
//     location: {
//       lat: -7.538187253606434,
//       lng: 112.69586123896379,
//     },
//   },
//   {
//     id: '2',
//     name: 'Halte Gedang',
//     location: {
//       lat: -7.534821268601081,
//       lng: 112.7009943812925,
//     },
//   },
//   {
//     id: '3',
//     name: 'Halte Tanggulangin',
//     location: {
//       lat: -7.506817796909948,
//       lng: 112.70835061396555,
//     },
//   },
//   {
//     id: '4',
//     name: 'Halte Keramean',
//     location: {
//       lat: -7.492142384978424,
//       lng: 112.71088839478483,
//     },
//   },
//   {
//     id: '5',
//     name: 'Halte Terminal Larangan',
//     location: {
//       lat: -7.466487921678383,
//       lng: 112.71220566779868,
//     },
//   },
//   {
//     id: '6',
//     name: 'Halte Lemahputro',
//     location: {
//       lat: -7.4522864665767115,
//       lng: 112.71496225430549,
//     },
//   },
//   {
//     id: '7',
//     name: 'Halte Alun - Alun Sidoarjo 1',
//     location: {
//       lat: -7.446935079124618,
//       lng: 112.71756969663404,
//     },
//   },
//   {
//     id: '8',
//     name: 'Halte Sun City 1',
//     location: {
//       lat: -7.449851327189758,
//       lng: 112.71033949663396,
//     },
//   },
//   {
//     id: '9',
//     name: 'Halte Pondok Mutiara',
//     location: {
//       lat: -7.44830467537489,
//       lng: 112.70236262169163,
//     },
//   },
// ]

// const routeSeeder: DeepPartial<Route> = {
//   name: 'Sidoarjo - Gresik',
//   operation_day: [1, 2, 3, 4, 5, 6, 7],
//   start_hour: '05:00',
//   end_hour: '22:00',
// }

// const stops = [
//   { id: '1', sequence: 1 },
//   { id: '2', sequence: 2 },
//   { id: '3', sequence: 3 },
//   { id: '4', sequence: 4 },
//   { id: '5', sequence: 5 },
//   { id: '6', sequence: 6 },
//   { id: '7', sequence: 7 },
//   { id: '8', sequence: 8 },
//   { id: '9', sequence: 9 },
// ]

// const seed = async () => {
//   await AppDataSource.initialize()
//   const routeService = container.resolve(RouteService)
//   await Route.save(routeSeeder)
//   const routeEntity = await Route.findOneByOrFail({ name: routeSeeder.name })

//   await routeService.updateRoute(routeEntity, stops)

//   // await Stop.save(stopsSeeder)
//   console.log(`Data berhasil di tambah`)

//   await AppDataSource.destroy()
// }

// seed()
