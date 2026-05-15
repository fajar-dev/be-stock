import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm'
import { StockVariant } from './stock-variant.entity'
import { Branch } from '../../branch/entities/branch.entity'

@Entity('stock_variant_branches')
@Unique(['stockVariantId', 'branchId'])
export class StockVariantBranch {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'stock_variant_id' })
    stockVariantId!: number

    @ManyToOne(() => StockVariant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'stock_variant_id' })
    stockVariant!: StockVariant

    @Column({ name: 'branch_id' })
    branchId!: number

    @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: Branch

    @Column({ type: 'int', default: 0 })
    quantity!: number
}
