import "reflect-metadata"
import { DataSource } from "typeorm"
import { config } from "./config"
import { Stock } from "../modules/stock/entities/stock.entity"
import { Unit } from "../modules/unit/entities/unit.entity"

/**
 * TypeORM Database Configuration
 * Uses centralized config from config.ts
 */
export const AppDataSource = new DataSource({
    type: "mysql",
    host: config.database.host,
    port: config.database.port,
    username: config.database.user,
    password: config.database.pass,
    database: config.database.name,
    synchronize: config.database.sync,
    entities: [Stock, Unit],
    migrations: [],
    subscribers: [],
    connectorPackage: "mysql2",
    charset: "utf8mb4_unicode_ci",
    extra: {
        multipleStatements: true
    }
})