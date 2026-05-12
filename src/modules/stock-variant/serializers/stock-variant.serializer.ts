import { StockVariant } from '../entities/stock-variant.entity';

export class StockVariantSerializer {
    static single(variant: StockVariant) {
        return {
            id: variant.id,
            code: variant.code,
            name: variant.name,
            description: variant.description ?? null,
            quantity: variant.quantity,
            stock: variant.stock ? { id: variant.stock.id, code: variant.stock.code, name: variant.stock.name, managementModel: variant.stock.managementModel } : null,
            createdAt: variant.createdAt,
        };
    }

    static collection(variants: StockVariant[]) {
        return variants.map(v => this.single(v));
    }
}
