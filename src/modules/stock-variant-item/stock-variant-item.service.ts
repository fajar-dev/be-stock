import { DataSource } from 'typeorm';
import { IStockVariantItemRepository } from './stock-variant-item.interface';
import { CreateStockVariantItemValidator } from './validators/stock-variant-item.validators';
import { IStockVariantRepository } from '../stock-variant/stock-variant.interface';
import { NotFoundException, BadRequestException } from '../../core/exceptions/base';
import { ManagementModel } from '../stock/stock.enum';
import { StockVariantItem } from './entities/stock-variant-item.entity';

export class StockVariantItemService {
    constructor(
        private readonly repository: IStockVariantItemRepository,
        private readonly stockVariantRepository: IStockVariantRepository,
        private readonly dataSource: DataSource,
    ) {}

    async getAll(page: number, limit: number) {
        return this.repository.findAll(page, limit);
    }

    async getByVariantId(stockVariantId: number, page: number, limit: number) {
        const variant = await this.stockVariantRepository.findById(stockVariantId);
        if (!variant) throw new NotFoundException(`Stock variant not found`);
        return this.repository.findByVariantId(stockVariantId, page, limit);
    }

    async getById(id: number) {
        const item = await this.repository.findById(id);
        if (!item) throw new NotFoundException(`Stock variant item not found`);
        return item;
    }

    async createBulk(data: CreateStockVariantItemValidator) {
        const variant = await this.stockVariantRepository.findById(data.stockVariantId);
        if (!variant) throw new NotFoundException(`Stock variant not found`);

        const managementModel = variant.stock.managementModel;
        if (managementModel === ManagementModel.UNIK) {
            throw new BadRequestException(`Cannot add items to UNIK variant individually`);
        }

        return this.dataSource.transaction(async (manager) => {
            const created: StockVariantItem[] = [];

            for (const item of data.item) {
                if (managementModel === ManagementModel.LOT) {
                    if (!item.lot) throw new BadRequestException(`lot is required for LOT item`);
                    if (item.quantity == null) throw new BadRequestException(`quantity is required for LOT item`);
                    created.push(await manager.save(manager.create(StockVariantItem, {
                        stockVariantId: data.stockVariantId,
                        lot: item.lot,
                        quantity: item.quantity,
                    })));
                } else if (managementModel === ManagementModel.SERIAL_NUMBER) {
                    if (!item.serialNumber) throw new BadRequestException(`serialNumber is required for SERIAL_NUMBER item`);
                    created.push(await manager.save(manager.create(StockVariantItem, {
                        stockVariantId: data.stockVariantId,
                        serialNumber: item.serialNumber,
                        quantity: 1,
                    })));
                }
            }

            return created;
        });
    }
}
