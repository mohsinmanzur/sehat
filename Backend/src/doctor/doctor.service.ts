import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from '../entities/doctor.entity';
import { Repository } from 'typeorm';
import { CreateDoctorDTO } from './dto/create-doctor.dto';

@Injectable()
export class DoctorService
{
    constructor(@InjectRepository(Doctor) private doctorRepo: Repository<Doctor>) {}

    async getDoctorByEmail(email: string)
    {
        return await this.doctorRepo.findOne({ where: { email } });
    }

    async createDoctor(doctorInfo: CreateDoctorDTO)
    {
        const doctor = this.doctorRepo.create(doctorInfo);
        return await this.doctorRepo.save(doctor);
    }

    async verifyDoctorEmail(email: string)
    {
        return await this.doctorRepo.update({ email }, { is_verified: true });
    }
}
