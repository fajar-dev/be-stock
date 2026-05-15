import { Context } from 'hono'
import { BranchService } from './branch.service'
import { ApiResponse } from '../../core/helpers/response'
import { BranchSerializer } from './serializers/branch.serializer'
import { CreateBranchValidator } from './validators/branch.validators'
import { PaginationValidator } from '../../core/validators/pagination.schema'

export class BranchController {
    constructor(private readonly service: BranchService) {}

    async index(c: Context) {
        const query = c.req.query('q') || ''
        const { page, limit } = c.req.valid('query' as never) as PaginationValidator
        const { data, total } = await this.service.getAll(page, limit, query)
        return ApiResponse.paginate(c, BranchSerializer.collection(data), total, page, limit, 'Branches retrieved successfully')
    }

    async show(c: Context) {
        const id = Number(c.req.param('id'))
        const branch = await this.service.getById(id)
        return ApiResponse.success(c, BranchSerializer.single(branch), 'Branch retrieved successfully')
    }

    async store(c: Context) {
        const data = c.req.valid('json' as never) as CreateBranchValidator
        const branch = await this.service.create(data)
        return ApiResponse.success(c, BranchSerializer.single(branch), 'Branch created successfully', 201)
    }
}
