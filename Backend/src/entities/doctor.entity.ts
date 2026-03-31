import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Doctor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ default: '' })
    phone: string;

    @Column()
    license_number: string;

    @Column({ nullable: true })
    associated_hospital: string;

    @Column({ nullable: true })
    specialization: string;

    @Column({ default: false })
    is_verified: boolean;
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}