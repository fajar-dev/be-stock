import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Conversion } from '../../conversion/entities/conversion.entity'

@Entity('units')
@Index(['isActive'])
@Index(['createdAt'])
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

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => Conversion, (conversion) => conversion.unitBasic, { cascade: true })
    conversionsBasic?: Conversion[]

    @OneToMany(() => Conversion, (conversion) => conversion.unitConversion, { cascade: true })
    conversionsConversion?: Conversion[]

}
