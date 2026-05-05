import { Stock } from '../entities/stock.entity'

export class StockSerializer {
    static single(stock: Stock) {
        return {
            id: stock.id,
            name: stock.name,
            sku: stock.sku,
            quantity: stock.quantity,
            unit: stock.unit,
            price: Number(stock.price),
            description: stock.description ?? null,
            createdAt: stock.createdAt,
            updatedAt: stock.updatedAt,
        }
    }

    static collection(stocks: Stock[]) {
        return stocks.map(stock => this.single(stock))
    }
}
