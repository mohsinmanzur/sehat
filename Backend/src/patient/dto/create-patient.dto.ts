import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsPhoneNumber, IsString, IsUUID } from "class-validator";

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export class CreatePatientDto
{
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsPhoneNumber()
    phone: string;

    @IsDate()
    @Type(() => Date)
    date_of_birth: Date;

    @IsEnum(bloodGroups)
    @IsOptional()
    blood_group?: string;

    @IsArray()
    @IsOptional()
    emergency_contacts?: Record<string, string>[];

    @IsNumber()
    @IsOptional()
    reward_points?: number;

    @IsBoolean()
    @IsOptional()
    is_research_opt_in?: boolean;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    created_at?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    updated_at?: Date;
}