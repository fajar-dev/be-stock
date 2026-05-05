import { Unit } from './entities/unit.entity'
import { CreateUnitValidator, UpdateUnitValidator } from './validators/unit.validators'

export interface IUnitRepository {
    findAll(page: number, limit: number, query: string, isActive: boolean): Promise<[Unit[], number]>
    findById(id: number): Promise<Unit | null>
    create(data: CreateUnitValidator): Promise<Unit>
}
