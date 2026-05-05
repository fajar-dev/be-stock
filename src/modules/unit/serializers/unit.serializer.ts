import { Unit } from '../entities/unit.entity'

export class UnitSerializer {
    static single(unit: Unit) {
        return {
            id: unit.id,
            name: unit.name,
            isActive: unit.isActive,
            createdAt: unit.createdAt
        }
    }

    static collection(units: Unit[]) {
        return units.map(unit => this.single(unit))
    }
}
