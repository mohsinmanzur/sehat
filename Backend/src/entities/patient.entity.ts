import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Medical_Document } from "./medical_document.entity";
import { Health_Measurement } from "./health_measurement.entity";
import { Access_Grant } from "./access_grant.entity";

@Entity()
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => Medical_Document, (doc) => doc.patient)
    medical_documents: Medical_Document[];

    @OneToMany(() => Health_Measurement, (measurement) => measurement.patient)
    health_measurements: Health_Measurement[];

    @OneToMany(() => Access_Grant, (grant) => grant.patient)
    access_grants: Access_Grant[];

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ enum: ['male', 'female', 'other'], default: 'male' })
    gender: string;

    @Column({ nullable: true, default: '000-000-0000' })
    phone: string;

    @Column()
    date_of_birth: Date;

    @Column({ nullable: true })
    blood_group?: string;

    @Column({ type: 'jsonb', nullable: true })
    emergency_contacts: Record<string, string>[];

    @Column({ default: 0 })
    reward_points: number;

    @Column({ default: false })
    is_research_opt_in: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}