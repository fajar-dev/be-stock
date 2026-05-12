import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Stock } from '../../stock/entities/stock.entity';

@Entity('stock_variants')
export class StockVariant {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne('Stock', (stock: Stock) => stock.stockVariants)
    @JoinColumn({ name: 'stock_id' })
    stock!: Stock;

    @Column({ name: 'stock_id' })
    stockId!: number;

    @Column({ length: 50, unique: true })
    code!: string;

    @Column({ length: 150 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @Column({ type: 'int', nullable: true, default: null, name: 'quantity' })
    quantity!: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
