import { Type } from "class-transformer";
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class ShareMeasurementDto {
    @IsOptional()
    @IsString()
    doctorEmail?: string;

    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    measurement_ids?: string[];

    @IsOptional()
    @IsString()
    permission?: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    expires_at: Date;
}
