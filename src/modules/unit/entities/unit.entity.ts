import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('units')
export class Unit {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ length: 100, })
    name!: string

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean

    @Column({ length: 100, nullable: true, name: 'created_by' })
    createdBy?: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date

}
