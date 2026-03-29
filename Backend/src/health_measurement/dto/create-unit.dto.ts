import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMeasurementUnitDto
{
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    unit_name: string;

    @IsString()
    symbol: string;
}