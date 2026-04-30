import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Measurement_Unit } from "./measurement_unit.entity";

@Entity()
export class Reference_Range {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Measurement_Unit, (unit) => unit.reference_ranges)
    @JoinColumn({ name: 'unit_id' })
    measurement_unit: Measurement_Unit;

    @Column('uuid')
    unit_id: string;

    @Column()
    min_value: number;

    @Column()
    max_value: number;

    @Column({
        enum: ['male', 'female', 'other'],
        nullable: true
    })
    target_gender: string;

    @Column({ nullable: true })
    min_age: number;

    @Column({ nullable: true })
    max_age: number;

    @Column({ nullable: true, type: 'text', array: true })
    special_conditions: string[];
}