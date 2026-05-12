import { DataSource } from 'typeorm'
import { NotFoundException } from '../../core/exceptions/base'
import { CreateUnitValidator } from './validators/unit.validators'
import { IUnitRepository } from './unit.interface'
import { Unit } from './entities/unit.entity'
import { Conversion } from '../conversion/entities/conversion.entity'

export class UnitService {
    constructor(
        private readonly repository: IUnitRepository,
        private readonly dataSource: DataSource,
    ) { }

    async getAll(page: number, limit: number, query: string, isActive: boolean) {
        const [data, total] = await this.repository.findAll(page, limit, query, isActive)
        return { data, total }
    }

    async getById(id: number) {
        const unit = await this.repository.findById(id)
        if (!unit) throw new NotFoundException(`Unit not found`)
        return unit
    }

    async create(validator: CreateUnitValidator): Promise<Unit> {
        return this.dataSource.transaction(async (manager) => {
            const unit = await manager.save(manager.create(Unit, validator))

            await manager.save(manager.create(Conversion, {
                name: `1 ${unit.name} = 1 ${unit.name}`,
                unitBasicId: unit.id,
                unitConversionId: unit.id,
                value: 1,
                isBaseConversion: true,
                isActive: true,
            }))

            return unit
        })
    }
}
