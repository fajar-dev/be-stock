import { AdditionalRepository } from './additional.repository'

export class AdditionalService {
    constructor(private readonly repository: AdditionalRepository) {}

    getConversions(query: string) {
        return this.repository.findConversions(query)
    }

    getBaseConversions(query: string) {
        return this.repository.findBaseConversions(query)
    }

    getBranches(query: string) {
        return this.repository.findBranches(query)
    }
}
