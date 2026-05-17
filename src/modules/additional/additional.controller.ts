import { Context } from 'hono'
import { AdditionalService } from './additional.service'
import { AdditionalSerializer } from './additional.serializer'
import { ApiResponse } from '../../core/helpers/response'

export class AdditionalController {
    constructor(private readonly service: AdditionalService) { }

    async conversions(c: Context) {
        const data = await this.service.getConversions(c.req.query('q') || '')
        return ApiResponse.success(c, AdditionalSerializer.conversions(data), 'Conversions retrieved successfully')
    }

    async baseConversions(c: Context) {
        const data = await this.service.getBaseConversions(c.req.query('q') || '')
        return ApiResponse.success(c, AdditionalSerializer.baseConversions(data), 'Base conversions retrieved successfully')
    }

    async branches(c: Context) {
        const data = await this.service.getBranches(c.req.query('q') || '')
        return ApiResponse.success(c, AdditionalSerializer.branches(data), 'Branches retrieved successfully')
    }

    async variants(c: Context) {
        const data = await this.service.getVariants(c.req.query('q') || '')
        return ApiResponse.success(c, AdditionalSerializer.variants(data), 'Variants retrieved successfully')
    }
}
