import { DataSource, Repository } from 'typeorm'
import { Branch } from './entities/branch.entity'
import { IBranchRepository } from './branch.interface'
import { CreateBranchValidator } from './validators/branch.validators'

export class BranchRepository implements IBranchRepository {
    private readonly repo: Repository<Branch>

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Branch)
    }

    findAll(page: number, limit: number, query: string): Promise<[Branch[], number]> {
        return this.repo.createQueryBuilder('branch')
            .where('branch.name LIKE :query OR branch.code LIKE :query', { query: `%${query}%` })
            .orderBy('branch.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
    }

    findById(id: number): Promise<Branch | null> {
        return this.repo.findOneBy({ id })
    }

    findByCode(code: string): Promise<Branch | null> {
        return this.repo.findOneBy({ code })
    }

    async create(data: CreateBranchValidator): Promise<Branch> {
        return this.repo.save(this.repo.create(data))
    }
}
