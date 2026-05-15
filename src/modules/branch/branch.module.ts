import { DataSource } from 'typeorm'
import { BranchRepository } from './branch.repository'
import { BranchService } from './branch.service'
import { BranchController } from './branch.controller'

export function createBranchController(dataSource: DataSource): BranchController {
    const repository = new BranchRepository(dataSource)
    const service = new BranchService(repository)
    return new BranchController(service)
}
