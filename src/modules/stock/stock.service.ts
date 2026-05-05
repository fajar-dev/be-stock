import { IStockRepository } from './stock.interface';
import { CreateStockValidator } from './validators/stock.validators';
import { NotFoundException, ConflictException } from '../../core/exceptions/base';

export class StockService {
    constructor(private readonly repository: IStockRepository) {}

    async getAll(page: number, limit: number) {
        return this.repository.findAll(page, limit);
    }

    async getById(id: number) {
        const stock = await this.repository.findById(id);
        if (!stock) throw new NotFoundException(`Stock with id '${id}' not found`);
        return stock;
    }

    async create(data: CreateStockValidator) {
        const existingCode = await this.repository.findByCode(data.code);
        if (existingCode) throw new ConflictException(`Stock code '${data.code}' already exists`);
        return this.repository.create(data);
    }
}
