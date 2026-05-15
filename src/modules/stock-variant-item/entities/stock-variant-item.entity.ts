import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { StockVariant } from '../../stock-variant/entities/stock-variant.entity';

@Entity('stock_variant_items')
export class StockVariantItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne('StockVariant', (variant: StockVariant) => variant.id)
    @JoinColumn({ name: 'stock_variant_id' })
    stockVariant!: StockVariant;

    @Column({ name: 'stock_variant_id' })
    stockVariantId!: number;

    @Column({ length: 100, nullable: true, name: 'serial_number', default: null })
    serialNumber!: string | null;

    @Column({ length: 100, nullable: true, default: null })
    lot!: string | null;

    @Column({ type: 'int', default: 0 })
    quantity!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
