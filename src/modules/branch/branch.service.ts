import { IBranchRepository } from './branch.interface'
import { CreateBranchValidator } from './validators/branch.validators'
import { NotFoundException, ConflictException } from '../../core/exceptions/base'

export class BranchService {
    constructor(private readonly repository: IBranchRepository) {}

    async getAll(page: number, limit: number, query: string) {
        const [data, total] = await this.repository.findAll(page, limit, query)
        return { data, total }
    }

    async getById(id: number) {
        const branch = await this.repository.findById(id)
        if (!branch) throw new NotFoundException(`Branch not found`)
        return branch
    }

    async create(data: CreateBranchValidator) {
        const existing = await this.repository.findByCode(data.code)
        if (existing) throw new ConflictException(`Branch code '${data.code}' already exists`)
        return this.repository.create(data)
    }
}
