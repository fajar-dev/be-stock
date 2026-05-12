import { DataSource } from 'typeorm';
import { StockController } from './stock.controller';
import { StockRepository } from './stock.repository';
import { StockService } from './stock.service';
import { ConversionRepository } from '../conversion/conversion.repository';

export function createStockController(dataSource: DataSource): StockController {
    const repository = new StockRepository(dataSource);
    const conversionRepository = new ConversionRepository(dataSource);
    const service = new StockService(repository, conversionRepository);
    return new StockController(service);
}
