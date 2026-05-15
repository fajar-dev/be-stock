import { Context } from 'hono';
import { StockVariantItemService } from './stock-variant-item.service';
import { ApiResponse } from '../../core/helpers/response';
import { StockVariantItemSerializer } from './serializers/stock-variant-item.serializer';
import { CreateStockVariantItemValidator } from './validators/stock-variant-item.validators';
import { PaginationValidator } from '../../core/validators/pagination.schema';

export class StockVariantItemController {
    constructor(private readonly service: StockVariantItemService) {}

    async index(c: Context) {
        const { page, limit } = c.req.valid('query' as never) as PaginationValidator;
        const [items, total] = await this.service.getAll(page, limit);
        return ApiResponse.paginate(c, StockVariantItemSerializer.collection(items), total, page, limit, 'Stock variant items retrieved successfully');
    }

    async byVariant(c: Context) {
        const stockVariantId = Number(c.req.param('variantId'));
        const { page, limit } = c.req.valid('query' as never) as PaginationValidator;
        const [items, total] = await this.service.getByVariantId(stockVariantId, page, limit);
        return ApiResponse.paginate(c, StockVariantItemSerializer.collection(items), total, page, limit, 'Stock variant items retrieved successfully');
    }

    async show(c: Context) {
        const id = Number(c.req.param('id'));
        const item = await this.service.getById(id);
        return ApiResponse.success(c, StockVariantItemSerializer.single(item), 'Stock variant item retrieved successfully', 200);
    }

    async store(c: Context) {
        const data = c.req.valid('json' as never) as CreateStockVariantItemValidator;
        const items = await this.service.createBulk(data);
        return ApiResponse.success(c, StockVariantItemSerializer.collection(items), 'Stock variant items created successfully', 201);
    }
}
