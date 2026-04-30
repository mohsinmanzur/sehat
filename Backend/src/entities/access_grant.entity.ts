import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./patient.entity";
import { Doctor } from "./doctor.entity";
import { Health_Measurement } from "./health_measurement.entity";

@Entity()
export class Access_Grant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Doctor, (doctor) => doctor.access_grants)
    @JoinColumn({ name: 'doctor_id' })
    doctor: Doctor;

    @Column('uuid')
    doctor_id: string;

    @ManyToOne(() => Patient, (patient) => patient.access_grants)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column('uuid')
    patient_id: string;

    @ManyToOne(() => Health_Measurement, (measurement) => measurement.access_grants)
    @JoinColumn({ name: 'measurement_id' })
    health_measurement: Health_Measurement;

    @Column('uuid', { nullable: true })
    measurement_id: string;

    @Column()
    access_token: string;

    @Column({
        enum: ['view_only', 'emergency', 'full_access'],
        default: 'view_only'
    })
    permission: string;

    @Column({ default: false })
    is_revoked: boolean;

    @Column()
    expires_at: Date;
}