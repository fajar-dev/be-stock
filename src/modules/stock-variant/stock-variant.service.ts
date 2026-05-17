import { DataSource } from 'typeorm';
import { IStockVariantRepository } from './stock-variant.interface';
import { CreateStockVariantValidator } from './validators/stock-variant.validators';
import { IStockRepository } from '../stock/stock.interface';
import { IBranchRepository } from '../branch/branch.interface';
import { NotFoundException, ConflictException, BadRequestException } from '../../core/exceptions/base';
import { StockVariant } from './entities/stock-variant.entity';
import { StockVariantBranch } from './entities/stock-variant-branch.entity';

export class StockVariantService {
    constructor(
        private readonly repository: IStockVariantRepository,
        private readonly stockRepository: IStockRepository,
        private readonly branchRepository: IBranchRepository,
        private readonly dataSource: DataSource,
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

    async createBulk(data: CreateStockVariantValidator) {
        const stock = await this.stockRepository.findById(data.stockId);
        if (!stock) throw new BadRequestException(`Stock not found`);

        return this.dataSource.transaction(async (manager) => {
            const created: StockVariant[] = [];

            for (const v of data.variant) {
                const branch = await this.branchRepository.findById(v.branchId);
                if (!branch) throw new BadRequestException(`Branch with id '${v.branchId}' not found`);

                let variant = await manager.findOne(StockVariant, { where: { code: v.code } });

                if (variant) {
                    const existingAlloc = await manager.findOne(StockVariantBranch, {
                        where: { stockVariantId: variant.id, branchId: v.branchId },
                    });
                    if (existingAlloc) throw new ConflictException(`Variant '${v.code}' sudah ada di branch ini`);
                } else {
                    variant = await manager.save(manager.create(StockVariant, {
                        stockId: data.stockId,
                        code: v.code,
                        name: v.name,
                        photo: typeof v.photo === 'string' ? v.photo : null,
                        description: v.description ?? null,
                    }));
                }

                await manager.save(manager.create(StockVariantBranch, {
                    stockVariantId: variant.id,
                    branchId: v.branchId,
                    quantity: 0,
                }));

                created.push(variant);
            }

            return created;
        });
    }
}
