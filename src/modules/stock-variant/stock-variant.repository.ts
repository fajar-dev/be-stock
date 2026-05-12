import { DataSource, Repository } from 'typeorm';
import { StockVariant } from './entities/stock-variant.entity';
import { IStockVariantRepository } from './stock-variant.interface';
import { CreateStockVariantValidator } from './validators/stock-variant.validators';

export class StockVariantRepository implements IStockVariantRepository {
    private readonly repo: Repository<StockVariant>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(StockVariant);
    }

    findAll(page: number, limit: number): Promise<[StockVariant[], number]> {
        return this.repo.findAndCount({
            relations: ['stock'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    findByStockId(stockId: number, page: number, limit: number): Promise<[StockVariant[], number]> {
        return this.repo.findAndCount({
            where: { stockId },
            relations: ['stock'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    findById(id: number): Promise<StockVariant | null> {
        return this.repo.findOne({ where: { id }, relations: ['stock'] });
    }

    findByCode(code: string): Promise<StockVariant | null> {
        return this.repo.findOne({ where: { code } });
    }

    create(data: CreateStockVariantValidator): Promise<StockVariant> {
        const variant = this.repo.create(data);
        return this.repo.save(variant);
    }
}
