import { DataSource, Repository } from 'typeorm';
import { StockVariantItem } from './entities/stock-variant-item.entity';
import { IStockVariantItemRepository } from './stock-variant-item.interface';
import { CreateStockVariantItemValidator } from './validators/stock-variant-item.validators';

export class StockVariantItemRepository implements IStockVariantItemRepository {
    private readonly repo: Repository<StockVariantItem>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(StockVariantItem);
    }

    findAll(page: number, limit: number): Promise<[StockVariantItem[], number]> {
        return this.repo.findAndCount({
            relations: ['stockVariant'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    findByVariantId(stockVariantId: number, page: number, limit: number): Promise<[StockVariantItem[], number]> {
        return this.repo.findAndCount({
            where: { stockVariantId },
            relations: ['stockVariant'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    findById(id: number): Promise<StockVariantItem | null> {
        return this.repo.findOne({ where: { id }, relations: ['stockVariant'] });
    }

    create(data: CreateStockVariantItemValidator): Promise<StockVariantItem> {
        const item = this.repo.create(data);
        return this.repo.save(item);
    }
}
