import { Context } from 'hono';
import { StockService } from './stock.service';
import { ApiResponse } from '../../core/helpers/response';
import { StockSerializer } from './serializers/stock.serializer';
import { CreateStockValidator } from './validators/stock.validators';
import { PaginationValidator } from '../../core/validators/pagination.schema';
import { MinioHelper } from '../../core/helpers/minio';

export class StockController {
    constructor(private readonly service: StockService) { }

    async index(c: Context) {
        const query = c.req.query('q') || ''
        const { page, limit } = c.req.valid('query' as never) as PaginationValidator;
        const [stocks, total] = await this.service.getAll(page, limit, query);
        const serializedStocks = await StockSerializer.collection(stocks);
        return ApiResponse.paginate(c, serializedStocks, total, page, limit, "Stocks retrieved successfully");
    }

    async show(c: Context) {
        const id = Number(c.req.param('id'));
        const stock = await this.service.getById(id);
        const serializedStock = await StockSerializer.single(stock);
        return ApiResponse.success(c, serializedStock, "Stock retrieved successfully", 200);
    }

    async store(c: Context) {
        const data = c.req.valid('form' as never) as CreateStockValidator;
        
        if (data.photo instanceof File) {
            data.photo = await MinioHelper.uploadFromFile(data.photo, 'stocks');
        }

        const stock = await this.service.create(data);
        const serializedStock = await StockSerializer.single(stock);
        return ApiResponse.success(c, serializedStock, "Stock created successfully", 201);
    }
}
