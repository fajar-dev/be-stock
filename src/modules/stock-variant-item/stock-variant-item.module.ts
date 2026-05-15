import { DataSource } from 'typeorm';
import { StockVariantItemRepository } from './stock-variant-item.repository';
import { StockVariantItemService } from './stock-variant-item.service';
import { StockVariantItemController } from './stock-variant-item.controller';
import { StockVariantRepository } from '../stock-variant/stock-variant.repository';

export function createStockVariantItemController(dataSource: DataSource): StockVariantItemController {
    const repository = new StockVariantItemRepository(dataSource);
    const stockVariantRepository = new StockVariantRepository(dataSource);
    const service = new StockVariantItemService(repository, stockVariantRepository, dataSource);
    return new StockVariantItemController(service);
}
