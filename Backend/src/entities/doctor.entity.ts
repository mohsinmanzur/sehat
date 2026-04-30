import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Access_Grant } from "./access_grant.entity";

@Entity()
export class Doctor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => Access_Grant, (grant) => grant.doctor)
    access_grants: Access_Grant[];

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({
        enum: ['male', 'female', 'other'],
        default: 'other',
        enumName: 'gender_enum'
    })
    gender: string;

    @Column()
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