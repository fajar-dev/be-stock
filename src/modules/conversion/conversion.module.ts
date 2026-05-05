import { DataSource } from 'typeorm'
import { ConversionController } from './conversion.controller'
import { ConversionRepository } from './conversion.repository'
import { ConversionService } from './conversion.service'

export function createConversionController(dataSource: DataSource): ConversionController {
    const repository = new ConversionRepository(dataSource)
    const service = new ConversionService(repository)
    return new ConversionController(service)
}
