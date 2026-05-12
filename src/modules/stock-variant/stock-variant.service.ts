import { IStockVariantRepository } from './stock-variant.interface';
import { CreateStockVariantValidator } from './validators/stock-variant.validators';
import { IStockRepository } from '../stock/stock.interface';
import { NotFoundException, ConflictException, BadRequestException } from '../../core/exceptions/base';
import { ManagementModel } from '../stock/stock.enum';

export class StockVariantService {
    constructor(
        private readonly repository: IStockVariantRepository,
        private readonly stockRepository: IStockRepository,
    ) {}

    async getAll(page: number, limit: number) {
        return this.repository.findAll(page, limit);
    }

    async getByStockId(stockId: number, page: number, limit: number) {
        const stock = await this.stockRepository.findById(stockId);
        if (!stock) throw new NotFoundException(`Stock not found`);
        return this.repository.findByStockId(stockId, page, limit);
    }

    async getById(id: number) {
        const variant = await this.repository.findById(id);
        if (!variant) throw new NotFoundException(`Stock variant not found`);
        return variant;
    }

    async create(data: CreateStockVariantValidator) {
        const stock = await this.stockRepository.findById(data.stockId);
        if (!stock) throw new BadRequestException(`Stock not found`);

        const existing = await this.repository.findByCode(data.code);
        if (existing) throw new ConflictException(`Stock variant code already exists`);

        const quantity = stock.managementModel === ManagementModel.UNIK ? (data.quantity ?? 0) : null;
        return this.repository.create({ ...data, quantity });
    }
}
