import { DataSource } from 'typeorm';
import { IStockVariantRepository } from './stock-variant.interface';
import { CreateStockVariantValidator } from './validators/stock-variant.validators';
import { IStockRepository } from '../stock/stock.interface';
import { NotFoundException, ConflictException, BadRequestException } from '../../core/exceptions/base';
import { ManagementModel } from '../stock/stock.enum';
import { StockVariant } from './entities/stock-variant.entity';
import { StockVariantItem } from '../stock-variant-item/entities/stock-variant-item.entity';

export class StockVariantService {
    constructor(
        private readonly repository: IStockVariantRepository,
        private readonly stockRepository: IStockRepository,
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
                const existing = await manager.findOne(StockVariant, { where: { code: v.code } });
                if (existing) throw new ConflictException(`Variant code '${v.code}' already exists`);

                if (stock.managementModel === ManagementModel.UNIK) {
                    if (v.quantity == null) throw new BadRequestException(`quantity required for UNIK variant`);
                } else {
                    if (!v.item?.length) throw new BadRequestException(`item required for ${stock.managementModel} variant`);
                }

                const variant = await manager.save(manager.create(StockVariant, {
                    stockId: data.stockId,
                    code: v.code,
                    name: v.name,
                    description: v.description ?? null,
                }));

                if (stock.managementModel === ManagementModel.UNIK) {
                    await manager.save(manager.create(StockVariantItem, {
                        stockVariantId: variant.id,
                        quantity: v.quantity!,
                    }));
                } else if (stock.managementModel === ManagementModel.LOT) {
                    for (const item of v.item!) {
                        if (!item.lot) throw new BadRequestException(`lot is required for LOT item`);
                        await manager.save(manager.create(StockVariantItem, {
                            stockVariantId: variant.id,
                            lot: item.lot,
                            quantity: item.quantity ?? 0,
                        }));
                    }
                } else if (stock.managementModel === ManagementModel.SERIAL_NUMBER) {
                    for (const item of v.item!) {
                        if (!item.serialNumber) throw new BadRequestException(`serialNumber is required for SERIAL_NUMBER item`);
                        await manager.save(manager.create(StockVariantItem, {
                            stockVariantId: variant.id,
                            serialNumber: item.serialNumber,
                            quantity: 1,
                        }));
                    }
                }

                created.push(variant);
            }

            return created;
        });
    }
}
