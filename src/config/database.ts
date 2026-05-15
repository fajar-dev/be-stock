import "reflect-metadata"
import { DataSource } from "typeorm"
import { config } from "./config"
import { Stock } from "../modules/stock/entities/stock.entity"
import { StockConversion } from "../modules/stock/entities/stock-conversion.entity"
import { Unit } from "../modules/unit/entities/unit.entity"
import { Conversion } from "../modules/conversion/entities/conversion.entity"
import { StockVariant } from "../modules/stock-variant/entities/stock-variant.entity"
import { StockVariantItem } from "../modules/stock-variant-item/entities/stock-variant-item.entity"

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
    entities: [Stock, StockConversion, Unit, Conversion, StockVariant, StockVariantItem],
    migrations: [],
    subscribers: [],
    connectorPackage: "mysql2",
    charset: "utf8mb4_unicode_ci",
    extra: {
        multipleStatements: true
    }
})