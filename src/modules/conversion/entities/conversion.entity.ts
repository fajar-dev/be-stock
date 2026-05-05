import {
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Entity,
    CreateDateColumn,
    type Relation
} from 'typeorm'
import { Unit } from '../../unit/entities/unit.entity'

@Entity('conversions')
export class Conversion {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ length: 150 })
    name!: string

    @Column({ name: 'unit_basic_id' })
    unitBasicId!: number

    @ManyToOne(() => Unit, (unit) => unit.conversionsBasic, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'unit_basic_id' })
    unitBasic!: Relation<Unit>

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    value!: number

    @Column({ name: 'unit_conversion_id' })
    unitConversionId!: number

    @ManyToOne(() => Unit, (unit) => unit.conversionsConversion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'unit_conversion_id' })
    unitConversion!: Relation<Unit>

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean

    @Column({ length: 100, nullable: true, name: 'created_by' })
    createdBy?: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date
}
