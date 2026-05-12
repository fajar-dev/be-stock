import { Context } from 'hono'
import { AdditionalService } from './additional.service'
import { ApiResponse } from '../../core/helpers/response'

export class AdditionalController {
    constructor(private readonly service: AdditionalService) {}

    async conversions(c: Context) {
        const data = await this.service.getConversions()
        return ApiResponse.success(c, data, 'Conversions retrieved successfully')
    }

    async baseConversions(c: Context) {
        const data = await this.service.getBaseConversions()
        return ApiResponse.success(c, data, 'Base conversions retrieved successfully')
    }
}
