import { StockVariant } from './entities/stock-variant.entity';
import { CreateStockVariantValidator } from './validators/stock-variant.validators';

export interface IStockVariantRepository {
    findAll(page: number, limit: number): Promise<[StockVariant[], number]>;
    findByStockId(stockId: number, page: number, limit: number): Promise<[StockVariant[], number]>;
    findById(id: number): Promise<StockVariant | null>;
    findByCode(code: string): Promise<StockVariant | null>;
    create(data: CreateStockVariantValidator): Promise<StockVariant>;
}
