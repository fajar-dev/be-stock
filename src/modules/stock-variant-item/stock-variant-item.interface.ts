import { StockVariantItem } from './entities/stock-variant-item.entity';
import { CreateStockVariantItemValidator } from './validators/stock-variant-item.validators';

export interface IStockVariantItemRepository {
    findAll(page: number, limit: number): Promise<[StockVariantItem[], number]>;
    findByVariantId(stockVariantId: number, page: number, limit: number): Promise<[StockVariantItem[], number]>;
    findById(id: number): Promise<StockVariantItem | null>;
    create(data: CreateStockVariantItemValidator): Promise<StockVariantItem>;
}
