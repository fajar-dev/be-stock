import { DataSource } from 'typeorm'
import { Conversion } from '../conversion/entities/conversion.entity'

export class AdditionalRepository {
    private readonly repo

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Conversion)
    }

    findConversions(): Promise<Pick<Conversion, 'id' | 'name'>[]> {
        return this.repo.find({
            select: { id: true, name: true },
            where: { isBaseConversion: false, isActive: true },
            order: { name: 'ASC' },
        })
    }

    findBaseConversions(): Promise<Pick<Conversion, 'id' | 'name'>[]> {
        return this.repo.find({
            select: { id: true, name: true },
            where: { isBaseConversion: true },
            order: { name: 'ASC' },
        })
    }
}
