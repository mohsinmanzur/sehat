import { Column, CreateDateColumn, Entity, ForeignKey, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Medical_Document } from "./medical_document.entity";
import { Measurement_Unit } from "./measurement_unit.entity";
import { Patient } from "./patient.entity";

@Entity()
export class Health_Measurement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ForeignKey(() => Medical_Document)
    @Column('uuid', { nullable: true })
    document_id: string;

    @ForeignKey(() => Patient)
    @Column('uuid')
    patient_id: string;

    @ForeignKey(() => Measurement_Unit)
    @Column('uuid')
    unit_id: string;

    @Column()
    numeric_value: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}