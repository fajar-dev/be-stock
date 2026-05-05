import { DataSource, Repository } from 'typeorm'
import { Stock } from './entities/stock.entity'
import { IStockRepository } from './stock.interface'
import { CreateStockValidator, UpdateStockValidator } from './validators/stock.validators'

export class StockRepository implements IStockRepository {
    private readonly repo: Repository<Stock>

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Stock)
    }

    findAll(page: number, limit: number): Promise<[Stock[], number]> {
        return this.repo.findAndCount({
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        })
    }

    findById(id: string): Promise<Stock | null> {
        return this.repo.findOneBy({ id })
    }

    findBySku(sku: string): Promise<Stock | null> {
        return this.repo.findOneBy({ sku })
    }

    async create(data: CreateStockValidator): Promise<Stock> {
        const stock = this.repo.create(data)
        return this.repo.save(stock)
    }

    async update(id: string, data: UpdateStockValidator): Promise<Stock> {
        await this.repo.update(id, data)
        return (await this.repo.findOneBy({ id }))!
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id)
    }
}
