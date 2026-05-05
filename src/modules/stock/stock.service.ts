import { IStockRepository } from './stock.interface';
import { CreateStockValidator } from './validators/stock.validators';
import { NotFoundException, ConflictException, BadRequestException } from '../../core/exceptions/base';
import { IUnitRepository } from '../unit/unit.interface';
import { IConversionRepository } from '../conversion/conversion.interface';

export class StockService {
    constructor(
        private readonly repository: IStockRepository,
        private readonly unitRepository: IUnitRepository,
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
        // Validate code uniqueness
        const existingCode = await this.repository.findByCode(data.code);
        if (existingCode) throw new ConflictException(`Stock code already exists`);

        // Validate unitId exists
        const unitExists = await this.unitRepository.findById(data.unitId);
        if (!unitExists) {
            throw new BadRequestException(`Unit not found`);
        }

        // Validate all conversion IDs exist if provided
        if (data.conversionUnit && data.conversionUnit.length > 0) {
            for (const conversionId of data.conversionUnit) {
                const conversionExists = await this.conversionRepository.findById(conversionId);
                if (!conversionExists) {
                    throw new BadRequestException(`Conversion not found`);
                }
            }
        }

        return this.repository.create(data);
    }
}
