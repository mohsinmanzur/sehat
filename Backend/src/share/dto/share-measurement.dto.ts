import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class ShareMeasurementDto {
    @IsNotEmpty()
    @IsString()
    doctorEmail: string;

    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    measurement_ids?: string[];

    @IsOptional()
    @IsString()
    permission?: string;
}
