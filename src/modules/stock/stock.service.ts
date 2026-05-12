import { IStockRepository } from './stock.interface';
import { CreateStockValidator } from './validators/stock.validators';
import { NotFoundException, ConflictException, BadRequestException } from '../../core/exceptions/base';
import { IConversionRepository } from '../conversion/conversion.interface';

export class StockService {
    constructor(
        private readonly repository: IStockRepository,
        private readonly conversionRepository: IConversionRepository
    ) {}

    async getAll(page: number, limit: number) {
        return this.repository.findAll(page, limit);
    }

    async getById(id: number) {
        const stock = await this.repository.findById(id);
        if (!stock) throw new NotFoundException(`Stock not found`);
        return stock;
    }

    async create(data: CreateStockValidator) {
        const existingCode = await this.repository.findByCode(data.code);
        if (existingCode) throw new ConflictException(`Stock code already exists`);

        const baseConversion = await this.conversionRepository.findBaseById(data.baseConversionId);
        if (!baseConversion) throw new BadRequestException(`Base conversion not found`);

        if (data.conversionUnit && data.conversionUnit.length > 0) {
            for (const conversionId of data.conversionUnit) {
                const exists = await this.conversionRepository.findById(conversionId);
                if (!exists) throw new BadRequestException(`Conversion not found`);
            }
        }

        return this.repository.create(data);
    }
}
