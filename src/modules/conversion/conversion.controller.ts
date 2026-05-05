import { Context } from 'hono'
import { ApiResponse } from '../../core/helpers/response'
import { CreateConversionValidator } from './validators/conversion.validators'
import { PaginationValidator } from '../../core/validators/pagination.schema'
import { ConversionService } from './conversion.service'
import { ConversionSerializer } from './serializers/conversion.serializer'

export class ConversionController {
    constructor(private readonly service: ConversionService) { }

    async index(c: Context) {
        const query = c.req.query('q') || ''
        const isActive = Boolean(c.req.query('is_active')) || true
        const { page, limit } = c.req.valid('query' as never) as PaginationValidator
        const { data, total } = await this.service.getAll(page, limit, query, isActive)
        return ApiResponse.paginate(c, ConversionSerializer.collection(data), total, page, limit, 'Conversions retrieved successfully')
    }

    async show(c: Context) {
        const id = Number(c.req.param('id'))
        const conversion = await this.service.getById(id)
        return ApiResponse.success(c, ConversionSerializer.single(conversion), 'Conversion retrieved successfully')
    }

    async store(c: Context) {
        const validator = c.req.valid('json' as never) as CreateConversionValidator
        const conversion = await this.service.create(validator)
        return ApiResponse.success(c, ConversionSerializer.single(conversion), 'Conversion created successfully', 201)
    }
}
