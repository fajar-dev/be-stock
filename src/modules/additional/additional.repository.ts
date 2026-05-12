import { DataSource, Like } from 'typeorm'
import { Conversion } from '../conversion/entities/conversion.entity'

export class AdditionalRepository {
    private readonly repo

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Conversion)
    }

    findConversions(query: string): Promise<Pick<Conversion, 'id' | 'name'>[]> {
        return this.repo.find({
            select: { id: true, name: true },
            where: { isBaseConversion: false, isActive: true, name: Like(`%${query}%`) },
            order: { name: 'ASC' },
        })
    }

    findBaseConversions(query: string): Promise<Pick<Conversion, 'id' | 'name'>[]> {
        return this.repo.find({
            select: { id: true, name: true },
            where: { isBaseConversion: true, name: Like(`%${query}%`) },
            order: { name: 'ASC' },
        })
    }
}
