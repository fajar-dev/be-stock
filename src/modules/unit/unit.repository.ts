import { DataSource, Like, Repository } from 'typeorm'
import { Unit } from './entities/unit.entity'
import { IUnitRepository } from './unit.interface'
import { CreateUnitValidator, UpdateUnitValidator } from './validators/unit.validators'
import { NotFoundException } from '../../core/exceptions/base'

export class UnitRepository implements IUnitRepository {
    private readonly repo: Repository<Unit>

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Unit)
    }

    findAll(page: number, limit: number, query: string, isActive: boolean): Promise<[Unit[], number]> {
        return this.repo.findAndCount({
            where: {
                name: Like(`%${query}%`),
                isActive: isActive
            },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        })
    }

    findById(id: number): Promise<Unit | null> {
        return this.repo.findOneBy({ id })
    }

    async create(data: CreateUnitValidator): Promise<Unit> {
        const unit = this.repo.create(data)
        return this.repo.save(unit)
    }
}
