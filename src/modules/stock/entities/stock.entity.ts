import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Conversion } from '../../conversion/entities/conversion.entity';
import { StockConversion } from './stock-conversion.entity';
import { ItemType, ToolType, Category, ManagementModel } from '../stock.enum';
import type { StockVariant } from '../../stock-variant/entities/stock-variant.entity';

@Entity('stocks')
export class Stock {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50, name: 'code', unique: true })
    code!: string;

    @Column({ length: 150, name: 'name' })
    name!: string;

    @Column({ type: 'enum', enum: ManagementModel, name: 'management_model' })
    managementModel!: ManagementModel;

    @ManyToOne(() => Conversion)
    @JoinColumn({ name: 'base_conversion_id' })
    baseConversion!: Conversion;

    @Column({ name: 'base_conversion_id' })
    baseConversionId!: number;

    @Column({ type: 'enum', enum: ItemType, name: 'item_type' })
    itemType!: ItemType;

    @Column({ type: 'enum', enum: ToolType, name: 'tool_type' })
    toolType!: ToolType;

    @Column({ type: 'enum', enum: Category, name: 'category' })
    category!: Category;

    @Column({ length: 255, nullable: true, name: 'photo_path' })
    photo?: string | null;

    @Column({ type: 'text', nullable: true, name: 'description' })
    description?: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => StockConversion, sc => sc.stock, { cascade: true })
    stockConversions?: StockConversion[];

    @OneToMany('StockVariant', (variant: StockVariant) => variant.stock)
    stockVariants?: StockVariant[];
}
