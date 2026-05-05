import { Context } from 'hono'
import { ApiResponse } from '../../core/helpers/response'
import { CreateStockValidator, UpdateStockValidator } from './validators/stock.validators'
import { PaginationValidator } from '../../core/validators/pagination.schema'
import { StockService } from './stock.service'
import { StockSerializer } from './serializers/stock.serializer'

export class StockController {
    constructor(
        private readonly service: StockService,
    ) { }

    async index(c: Context) {
        const { page, limit } = c.req.valid('query' as never) as PaginationValidator
        const { data, total } = await this.service.getAll(page, limit)
        return ApiResponse.paginate(c, StockSerializer.collection(data), total, page, limit, 'Stocks retrieved successfully')
    }

    async show(c: Context) {
        const id = c.req.param('id') as string
        const stock = await this.service.getById(id)
        return ApiResponse.success(c, StockSerializer.single(stock), 'Stock retrieved successfully')
    }

    async store(c: Context) {
        const validator = await c.req.json<CreateStockValidator>()
        const stock = await this.service.create(validator)
        return ApiResponse.success(c, StockSerializer.single(stock), 'Stock created successfully', 201)
    }

    async update(c: Context) {
        const id = c.req.param('id') as string
        const validator = await c.req.json<UpdateStockValidator>()
        const stock = await this.service.update(id, validator)
        return ApiResponse.success(c, StockSerializer.single(stock), 'Stock updated successfully')
    }

    async destroy(c: Context) {
        const id = c.req.param('id') as string
        await this.service.delete(id)
        return ApiResponse.success(c, null, 'Stock deleted successfully')
    }
}
