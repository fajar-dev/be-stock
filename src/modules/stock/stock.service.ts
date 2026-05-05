import { ConflictException, NotFoundException } from '../../core/exceptions/base'
import { CreateStockValidator, UpdateStockValidator } from './validators/stock.validators'
import { IStockRepository } from './stock.interface'

export class StockService {
    constructor(
        private readonly repository: IStockRepository
    ) { }

    async getAll(page: number, limit: number) {
        const [data, total] = await this.repository.findAll(page, limit)
        return { data, total }
    }

    async getById(id: string) {
        const stock = await this.repository.findById(id)
        if (!stock) throw new NotFoundException(`Stock with id '${id}' not found`)
        return stock
    }

    async create(validator: CreateStockValidator) {
        const existing = await this.repository.findBySku(validator.sku)
        if (existing) throw new ConflictException(`SKU already exists`)
        return this.repository.create(validator)
    }

    async update(id: string, validator: UpdateStockValidator) {
        await this.getById(id)

        if (validator.sku) {
            const existing = await this.repository.findBySku(validator.sku)
            if (existing && existing.id !== id) {
                throw new ConflictException(`SKU already used by another stock`)
            }
        }

        return this.repository.update(id, validator)
    }

    async delete(id: string) {
        await this.getById(id)
        await this.repository.delete(id)
    }
}
