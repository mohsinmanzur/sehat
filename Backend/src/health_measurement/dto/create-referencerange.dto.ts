import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateReferenceRangeDto
{
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsUUID()
    unit_id: string;

    @IsNumber()
    min_value: number;

    @IsNumber()
    max_value: number;

    @IsOptional()
    @IsEnum(['male', 'female', 'other'])
    target_gender?: 'male' | 'female' | 'other';

    @IsNumber()
    @IsOptional()
    min_age?: number;

    @IsNumber()
    @IsOptional()
    max_age?: number;

    @IsString()
    @IsOptional()
    special_condition?: string;
}