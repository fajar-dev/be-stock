import { DataSource } from 'typeorm'
import { UnitRepository } from './unit.repository'
import { UnitService } from './unit.service'
import { UnitController } from './unit.controller'

export function createUnitController(dataSource: DataSource): UnitController {
    const repository = new UnitRepository(dataSource)
    const service = new UnitService(repository, dataSource)
    return new UnitController(service)
}
