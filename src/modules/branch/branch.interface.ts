import { Branch } from './entities/branch.entity'
import { CreateBranchValidator } from './validators/branch.validators'

export interface IBranchRepository {
    findAll(page: number, limit: number, query: string): Promise<[Branch[], number]>
    findById(id: number): Promise<Branch | null>
    findByCode(code: string): Promise<Branch | null>
    create(data: CreateBranchValidator): Promise<Branch>
}
