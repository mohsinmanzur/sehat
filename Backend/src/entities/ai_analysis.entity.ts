import { Column, CreateDateColumn, Entity, ForeignKey, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Medical_Document } from "./medical_document.entity";

@Entity()
export class AI_Analysis {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ForeignKey(() => Medical_Document)
    @Column('uuid')
    document_id: string;

    @Column({ default: false })
    anomaly_detected: boolean;

    @Column({ nullable: true })
    suggested_text: string;

    @Column()
    severity_score: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}