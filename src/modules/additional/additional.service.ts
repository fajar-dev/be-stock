import { AdditionalRepository } from './additional.repository'

export class AdditionalService {
    constructor(private readonly repository: AdditionalRepository) {}

    getConversions() {
        return this.repository.findConversions()
    }

    getBaseConversions() {
        return this.repository.findBaseConversions()
    }
}
