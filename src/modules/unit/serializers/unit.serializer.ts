import { Unit } from '../entities/unit.entity'

export class UnitSerializer {
    static single(unit: Unit) {
        return {
            id: unit.id,
            name: unit.name,
            isActive: unit.isActive,
            stocks: (unit.conversionsBasic ?? []).flatMap(c => c.stocksBase ?? []).map(s => ({
                id: s.id,
                code: s.code,
                name: s.name,
            })),
            createdAt: unit.createdAt
        }
    }

    static collection(units: Unit[]) {
        return units.map(unit => this.single(unit))
    }
}
