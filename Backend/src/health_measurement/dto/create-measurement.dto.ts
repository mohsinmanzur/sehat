import { IsDate, IsNumber, IsOptional, IsUUID } from "class-validator";

export class CreateMeasurementDto
{
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsUUID()
    @IsOptional()
    document_id?: string;

    @IsUUID()
    patient_id: string;

    @IsUUID()
    unit_id: string;

    @IsNumber()
    numeric_value: number;

    @IsDate()
    @IsOptional()
    created_at?: Date;

    @IsDate()
    @IsOptional()
    updated_at?: Date;
}