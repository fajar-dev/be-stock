import { Context } from 'hono'
import { ApiResponse } from '../../core/helpers/response'
import { CreateUnitValidator } from './validators/unit.validators'
import { PaginationValidator } from '../../core/validators/pagination.schema'
import { UnitService } from './unit.service'
import { UnitSerializer } from './serializers/unit.serializer'

export class UnitController {
    constructor(private readonly service: UnitService) { }

    async index(c: Context) {
        const query = c.req.query('q') || ''
        const isActive = Boolean(c.req.query('is_active')) || true
        const { page, limit } = c.req.valid('query' as never) as PaginationValidator
        const { data, total } = await this.service.getAll(page, limit, query, isActive)
        return ApiResponse.paginate(c, UnitSerializer.collection(data), total, page, limit, 'Units retrieved successfully')
    }

    async show(c: Context) {
        const id = Number(c.req.param('id'))
        const unit = await this.service.getById(id)
        return ApiResponse.success(c, UnitSerializer.single(unit), 'Unit retrieved successfully')
    }

    async store(c: Context) {
        const validator = await c.req.json<CreateUnitValidator>()
        const unit = await this.service.create(validator)
        return ApiResponse.success(c, UnitSerializer.single(unit), 'Unit created successfully', 201)
    }
}
