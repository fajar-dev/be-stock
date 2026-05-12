import { Context } from 'hono';
import { StockVariantService } from './stock-variant.service';
import { ApiResponse } from '../../core/helpers/response';
import { StockVariantSerializer } from './serializers/stock-variant.serializer';
import { CreateStockVariantValidator } from './validators/stock-variant.validators';
import { PaginationValidator } from '../../core/validators/pagination.schema';

export class StockVariantController {
    constructor(private readonly service: StockVariantService) {}

    async index(c: Context) {
        const { page, limit } = c.req.valid('query' as never) as PaginationValidator;
        const [variants, total] = await this.service.getAll(page, limit);
        return ApiResponse.paginate(c, await StockVariantSerializer.collection(variants), total, page, limit, 'Stock variants retrieved successfully');
    }

    async byStock(c: Context) {
        const stockId = Number(c.req.param('stockId'));
        const { page, limit } = c.req.valid('query' as never) as PaginationValidator;
        const [variants, total] = await this.service.getByStockId(stockId, page, limit);
        return ApiResponse.paginate(c, await StockVariantSerializer.collection(variants), total, page, limit, 'Stock variants retrieved successfully');
    }

    async show(c: Context) {
        const id = Number(c.req.param('id'));
        const variant = await this.service.getById(id);
        return ApiResponse.success(c, await StockVariantSerializer.single(variant), 'Stock variant retrieved successfully', 200);
    }

    async store(c: Context) {
        const data = c.req.valid('json' as never) as CreateStockVariantValidator;
        const variant = await this.service.create(data);
        return ApiResponse.success(c, StockVariantSerializer.single(variant), 'Stock variant created successfully', 201);
    }
}
