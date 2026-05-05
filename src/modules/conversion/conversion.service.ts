import { IConversionRepository } from './conversion.interface'
import { CreateConversionValidator } from './validators/conversion.validators'
import { BadRequestException, NotFoundException } from '../../core/exceptions/base'
import { IUnitRepository } from '../unit/unit.interface'

export class ConversionService {
    constructor(
        private readonly repository: IConversionRepository,
        private readonly unitRepository: IUnitRepository
    ) { }

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
        const unitBasic = await this.unitRepository.findById(data.unitBasicId)
        if (!unitBasic) throw new BadRequestException(`Unit basic not found`)

        const unitConversion = await this.unitRepository.findById(data.unitConversionId)
        if (!unitConversion) throw new BadRequestException(`Unit conversion not found`)

        return this.repository.create(data)
    }
}
