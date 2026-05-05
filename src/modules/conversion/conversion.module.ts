import { DataSource } from 'typeorm'
import { ConversionController } from './conversion.controller'
import { ConversionRepository } from './conversion.repository'
import { ConversionService } from './conversion.service'
import { UnitRepository } from '../unit/unit.repository'

export function createConversionController(dataSource: DataSource): ConversionController {
    const repository = new ConversionRepository(dataSource)
    const unitRepository = new UnitRepository(dataSource)
    const service = new ConversionService(repository, unitRepository)
    return new ConversionController(service)
}
