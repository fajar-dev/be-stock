import { DataSource } from 'typeorm'
import { AdditionalRepository } from './additional.repository'
import { AdditionalService } from './additional.service'
import { AdditionalController } from './additional.controller'

export function createAdditionalController(dataSource: DataSource): AdditionalController {
    const repository = new AdditionalRepository(dataSource)
    const service = new AdditionalService(repository)
    return new AdditionalController(service)
}
