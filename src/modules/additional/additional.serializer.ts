import type { Conversion } from '../conversion/entities/conversion.entity'
import type { Branch } from '../branch/entities/branch.entity'
import type { StockVariant } from '../stock-variant/entities/stock-variant.entity'

export class AdditionalSerializer {
    static conversions(data: Pick<Conversion, 'id' | 'name'>[]) {
        return data.map(c => ({ id: c.id, name: c.name }))
    }

    static baseConversions(data: Pick<Conversion, 'id' | 'name'>[]) {
        return data.map(c => ({ id: c.id, name: c.name }))
    }

    static branches(data: Pick<Branch, 'id' | 'code' | 'name'>[]) {
        return data.map(b => ({ id: b.id, code: b.code, name: b.name }))
    }

    static variants(data: StockVariant[]) {
        return data.map(v => {
            const base = v.stock?.baseConversion ?? null
            const fromJoin = (v.stock?.stockConversions ?? []).map(sc => sc.conversion).filter(Boolean)
            const seen = new Set<number>()
            const conversion = [...(base ? [base] : []), ...fromJoin]
                .filter(c => {
                    if (seen.has(c.id)) return false
                    seen.add(c.id)
                    return true
                })
                .map(c => ({ id: c.id, name: c.name, isBaseConversion: c.isBaseConversion }))

            return {
                id: v.id,
                code: v.code,
                name: v.name,
                conversion,
                stock: v.stock
                    ? { id: v.stock.id, code: v.stock.code, name: v.stock.name, managementModel: v.stock.managementModel }
                    : null,
            }
        })
    }
}
