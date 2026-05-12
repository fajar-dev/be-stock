import { DataSource, Repository } from 'typeorm'
import { Unit } from './entities/unit.entity'
import { IUnitRepository } from './unit.interface'
import { CreateUnitValidator } from './validators/unit.validators'

export class UnitRepository implements IUnitRepository {
    private readonly repo: Repository<Unit>

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Unit)
    }

    findAll(page: number, limit: number, query: string, isActive: boolean): Promise<[Unit[], number]> {
        return this.repo.createQueryBuilder('unit')
            .leftJoinAndSelect('unit.conversionsBasic', 'conv', 'conv.isBaseConversion = :base', { base: true })
            .leftJoinAndSelect('conv.stocksBase', 'stock')
            .where('unit.name LIKE :query', { query: `%${query}%` })
            .andWhere('unit.isActive = :isActive', { isActive })
            .orderBy('unit.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
    }

    findById(id: number): Promise<Unit | null> {
        return this.repo.createQueryBuilder('unit')
            .leftJoinAndSelect('unit.conversionsBasic', 'conv', 'conv.isBaseConversion = :base', { base: true })
            .leftJoinAndSelect('conv.stocksBase', 'stock')
            .where('unit.id = :id', { id })
            .getOne()
    }

    async create(data: CreateUnitValidator): Promise<Unit> {
        const unit = this.repo.create(data)
        return this.repo.save(unit)
    }
}
