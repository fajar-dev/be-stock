import { Stock } from './entities/stock.entity';
import { CreateStockValidator } from './validators/stock.validators';

export interface IStockRepository {
    findAll(page: number, limit: number, query: string): Promise<[Stock[], number]>;
    findById(id: number): Promise<Stock | null>;
    findByCode(code: string): Promise<Stock | null>;
    create(data: CreateStockValidator): Promise<Stock>;
}
