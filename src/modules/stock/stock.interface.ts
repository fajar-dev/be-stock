import { Stock } from './entities/stock.entity'
import { CreateStockValidator, UpdateStockValidator } from './validators/stock.validators'

export interface IStockRepository {
    findAll(page: number, limit: number): Promise<[Stock[], number]>
    findById(id: string): Promise<Stock | null>
    findBySku(sku: string): Promise<Stock | null>
    create(data: CreateStockValidator): Promise<Stock>
    update(id: string, data: UpdateStockValidator): Promise<Stock>
    delete(id: string): Promise<void>
}
