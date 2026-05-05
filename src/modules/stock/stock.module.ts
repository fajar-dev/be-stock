import { DataSource } from 'typeorm'
import { StockRepository } from './stock.repository'
import { StockService } from './stock.service'
import { StockController } from './stock.controller'

export function createStockController(dataSource: DataSource): StockController {
    const repository = new StockRepository(dataSource)
    const service = new StockService(repository)
    return new StockController(service)
}
