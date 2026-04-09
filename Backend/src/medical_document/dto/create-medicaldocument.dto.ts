import { Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMedicalDocumentDto
{
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsUUID()
    patient_id: string;

    @IsString()
    @IsOptional()
    file_name?: string;

    @IsString()
    @IsOptional()
    file_url?: string;

    @IsEnum(['lab_report', 'prescription', 'imaging', 'other'])
    record_type: 'lab_report' | 'prescription' | 'imaging' | 'other';

    @IsString()
    @IsOptional()
    ocr_extracted_text?: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    date_issued?: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    created_at?: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    updated_at?: Date;
}