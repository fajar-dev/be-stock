import { IConversionRepository } from './conversion.interface'
import { CreateConversionValidator } from './validators/conversion.validators'
import { NotFoundException } from '../../core/exceptions/base'

export class ConversionService {
    constructor(private readonly repository: IConversionRepository) { }

    async getAll(page: number, limit: number, query: string, isActive: boolean) {
        const [data, total] = await this.repository.findAll(page, limit, query, isActive)
        return { data, total }
    }

    async getById(id: number) {
        const conversion = await this.repository.findById(id)
        if (!conversion) throw new NotFoundException(`Conversion not found`)
        return conversion
    }

    async create(data: CreateConversionValidator) {
        return this.repository.create(data)
    }
}
