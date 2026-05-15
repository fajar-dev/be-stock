import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'

@Entity('branches')
export class Branch {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ length: 50, unique: true })
    code!: string

    @Column({ length: 100 })
    name!: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date
}
