// import { kafka } from '@/config/kafka'
// import { getDeviceKey, redisClient } from '@/config/redis'
// import { DevicePosition } from '@/object/device.object'

// const producer = kafka.producer()
// const consumer = kafka.consumer({
//   groupId: 'Position-device-group',
// })

// const processPosition = async () => {
//   try {
//     await producer.connect()
//     await consumer.connect()

//     await consumer.subscribe({
//       topic: 'POSITION_UPDATE',
//       fromBeginning: true,
//     })
//     await consumer.run({
//       eachMessage: async ({ message }) => {
//         if (!message.value) {
//           return
//         }

//         const position: DevicePosition = JSON.parse(message.value.toString())
//         const deviceId = position.deviceId

//         if (!deviceId) {
//           return
//         }

//         const deviceData = await redisClient.get(getDeviceKey(deviceId))
//       },
//     })
//   } catch {}
// }
