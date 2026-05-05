import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'

@Entity('stocks')
export class Stock {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ length: 150 })
    name!: string

    @Column({ length: 100, unique: true })
    sku!: string

    @Column({ type: 'int', default: 0 })
    quantity!: number

    @Column({ length: 50, default: 'pcs' })
    unit!: string

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    price!: number

    @Column({ type: 'text', nullable: true })
    description!: string | null

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date
}
