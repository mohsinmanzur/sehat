import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Patient } from "./patient.entity";
import { Health_Measurement } from "./health_measurement.entity";
import { AI_Analysis } from "./ai_analysis.entity";

@Entity()
export class Medical_Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Patient, (patient) => patient.medical_documents)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column('uuid')
    patient_id: string;

    @OneToMany(() => Health_Measurement, (measurement) => measurement.medical_document)
    health_measurements: Health_Measurement[];

    @OneToMany(() => AI_Analysis, (analysis) => analysis.medical_document)
    ai_analyses: AI_Analysis[];

    @Column()
    file_name: string;

    @Column()
    file_url: string;

    @Column({
        type: 'enum',
        enum: ['lab_report', 'prescription', 'imaging', 'other'],
        default: 'other'
    })
    record_type: string;

    @Column({ nullable: true })
    ocr_extracted_text: string;

    @Column({ nullable: true })
    date_issued: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}