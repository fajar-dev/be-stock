import { DataSource } from 'typeorm';
import { StockVariantRepository } from './stock-variant.repository';
import { StockVariantService } from './stock-variant.service';
import { StockVariantController } from './stock-variant.controller';
import { StockRepository } from '../stock/stock.repository';
import { BranchRepository } from '../branch/branch.repository';

export function createStockVariantController(dataSource: DataSource): StockVariantController {
    const repository = new StockVariantRepository(dataSource);
    const stockRepository = new StockRepository(dataSource);
    const branchRepository = new BranchRepository(dataSource);
    const service = new StockVariantService(repository, stockRepository, branchRepository, dataSource);
    return new StockVariantController(service);
}
