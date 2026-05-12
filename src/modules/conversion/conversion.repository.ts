import { DataSource, Like, Repository } from 'typeorm'
import { Conversion } from './entities/conversion.entity'
import { IConversionRepository } from './conversion.interface'
import { CreateConversionValidator } from './validators/conversion.validators'

export class ConversionRepository implements IConversionRepository {
    private readonly repo: Repository<Conversion>

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Conversion)
    }

    findAll(page: number, limit: number, query: string, isActive: boolean): Promise<[Conversion[], number]> {
        return this.repo.findAndCount({
            relations: ['unitBasic', 'unitConversion', 'stockConversions', 'stockConversions.stock'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            where: {
                name: Like(`%${query}%`),
                isActive,
                isBaseConversion: false
            },
        })
    }

    findById(id: number): Promise<Conversion | null> {
        return this.repo.findOne({
            where: { id, isBaseConversion: false },
            relations: ['unitBasic', 'unitConversion', 'stockConversions', 'stockConversions.stock']
        })
    }

    findBaseById(id: number): Promise<Conversion | null> {
        return this.repo.findOne({
            where: { id, isBaseConversion: true },
            relations: ['unitBasic', 'unitConversion']
        })
    }

    async create(data: CreateConversionValidator): Promise<Conversion> {
        const conversion = this.repo.create(data)
        const saved = await this.repo.save(conversion)
        return this.findById(saved.id) as Promise<Conversion>
    }

    async createBaseConversion(unitId: number, unitName: string): Promise<Conversion> {
        const conversion = this.repo.create({
            name: `1 ${unitName} = 1 ${unitName}`,
            unitBasicId: unitId,
            unitConversionId: unitId,
            value: 1,
            isBaseConversion: true,
            isActive: true,
        })
        return this.repo.save(conversion)
    }
}
