import { ConflictException, NotFoundException } from '../../core/exceptions/base'
import { CreateUnitValidator, UpdateUnitValidator } from './validators/unit.validators'
import { IUnitRepository } from './unit.interface'

export class UnitService {
    constructor(private readonly repository: IUnitRepository) {}

    async getAll(page: number, limit: number, query: string, isActive: boolean) {
        const [data, total] = await this.repository.findAll(page, limit, query, isActive)
        return { data, total }
    }

    async getById(id: number) {
        const unit = await this.repository.findById(id)
        if (!unit) throw new NotFoundException(`Unit not found`)
        return unit
    }

    async create(validator: CreateUnitValidator) {
        return this.repository.create(validator)
    }
}
