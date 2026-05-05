import { Conversion } from './entities/conversion.entity'
import { CreateConversionValidator } from './validators/conversion.validators'

export interface IConversionRepository {
    findAll(page: number, limit: number, query: string, isActive: boolean): Promise<[Conversion[], number]>
    findById(id: number): Promise<Conversion | null>
    create(data: CreateConversionValidator): Promise<Conversion>
}
