import { DataSource, Like } from 'typeorm'
import { Conversion } from '../conversion/entities/conversion.entity'
import { Branch } from '../branch/entities/branch.entity'

export class AdditionalRepository {
    private readonly conversionRepo
    private readonly branchRepo

    constructor(dataSource: DataSource) {
        this.conversionRepo = dataSource.getRepository(Conversion)
        this.branchRepo = dataSource.getRepository(Branch)
    }

    findConversions(query: string): Promise<Pick<Conversion, 'id' | 'name'>[]> {
        return this.conversionRepo.find({
            select: { id: true, name: true },
            where: { isBaseConversion: false, isActive: true, name: Like(`%${query}%`) },
            order: { name: 'ASC' },
        })
    }

    findBaseConversions(query: string): Promise<Pick<Conversion, 'id' | 'name'>[]> {
        return this.conversionRepo.find({
            select: { id: true, name: true },
            where: { isBaseConversion: true, name: Like(`%${query}%`) },
            order: { name: 'ASC' },
        })
    }

    findBranches(query: string): Promise<Pick<Branch, 'id' | 'code' | 'name'>[]> {
        return this.branchRepo.find({
            select: { id: true, code: true, name: true },
            where: [
                { name: Like(`%${query}%`) },
                { code: Like(`%${query}%`) },
            ],
            order: { name: 'ASC' },
        })
    }
}
