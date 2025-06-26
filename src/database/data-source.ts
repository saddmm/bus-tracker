import { DataSource } from 'typeorm'
import 'dotenv/config'
import 'reflect-metadata'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: ['src/database/entities/*.ts'],
  migrations: [],
  subscribers: [],
})
