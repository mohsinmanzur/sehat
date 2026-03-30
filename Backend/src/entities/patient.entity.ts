import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;    

    @Column()
    email: string;

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