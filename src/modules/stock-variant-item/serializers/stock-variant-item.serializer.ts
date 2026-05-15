import { StockVariantItem } from '../entities/stock-variant-item.entity';

export class StockVariantItemSerializer {
    static single(item: StockVariantItem) {
        return {
            id: item.id,
            stockVariantId: item.stockVariantId,
            stockVariant: item.stockVariant ? { id: item.stockVariant.id, code: item.stockVariant.code, name: item.stockVariant.name } : null,
            serialNumber: item.serialNumber ?? null,
            lot: item.lot ?? null,
            quantity: item.quantity,
            createdAt: item.createdAt,
        };
    }

    static collection(items: StockVariantItem[]) {
        return items.map(i => this.single(i));
    }
}
