import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { Stock } from './stock.entity';
import { Conversion } from '../../conversion/entities/conversion.entity';

@Entity('stock_conversions')
export class StockConversion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'stock_id' })
    stockId!: number;

    @ManyToOne(() => Stock, stock => stock.stockConversions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'stock_id' })
    stock!: Relation<Stock>;

    @Column({ name: 'conversion_id' })
    conversionId!: number;

    @ManyToOne(() => Conversion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversion_id' })
    conversion!: Relation<Conversion>;
}
