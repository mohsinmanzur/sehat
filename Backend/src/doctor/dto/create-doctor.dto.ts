import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, IsUUID } from "class-validator";

export class CreateDoctorDTO
{
    @IsOptional()
    @IsUUID()
    id?: string;

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsEnum(['male', 'female', 'other'])
    gender: string;

    @IsPhoneNumber()
    phone: string;

    @IsString()
    license_number: string;

    @IsOptional()
    @IsString()
    associated_hospital?: string;

    @IsOptional()
    @IsString()
    specialization?: string;
}