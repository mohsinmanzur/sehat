import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Access_Grant } from '../entities/access_grant.entity';
import { In, Repository } from 'typeorm';
import { ShareMeasurementDto } from './dto/share-measurement.dto';
import { DoctorService } from '../doctor/doctor.service';
import { AccessGrantType } from './types/access_grant.type';
import { Doctor } from 'src/entities/doctor.entity';
import { Health_Measurement } from 'src/entities/health_measurement.entity';
import { HealthMeasurementType } from 'src/health_measurement/types/health_measurement.type';

@Injectable()
export class ShareService {
    constructor(
        @InjectRepository(Access_Grant)
        private accessGrantRepo: Repository<Access_Grant>,
        @InjectRepository(Health_Measurement)
        private healthMeasurementRepo: Repository<Health_Measurement>,
        private doctorService: DoctorService
    ) { }

    async shareMeasurement(patientId: string, shareDto: ShareMeasurementDto): Promise<AccessGrantType | null> {
        if (!patientId) throw new Error('Patient ID is required!');

        let doctor: Doctor | undefined;
        if (shareDto.doctorEmail) {
            doctor = await this.doctorService.getDoctorByEmail(shareDto.doctorEmail) || undefined;
        }

        const accessGrant = this.accessGrantRepo.create({
            patient_id: patientId,
            doctor_id: doctor?.id,
            measurement_ids: shareDto.measurement_ids,
            permission: shareDto.permission || 'view_only',
            access_token: Math.floor(100000 + Math.random() * 900000).toString(),
            expires_at: shareDto.expires_at,
        });

        await this.accessGrantRepo.save(accessGrant);
        return await this.accessGrantRepo.findOne({
            where: { id: accessGrant.id },
            relations: ['doctor', 'patient']
        });
    }

    async getPatientShares(patientId: string): Promise<AccessGrantType[]> {
        if (!patientId) throw new Error('Patient ID is required!');

        return await this.accessGrantRepo.find({
            where: { patient_id: patientId, is_revoked: false },
            relations: ['doctor', 'patient']
        });
    }

    async getSharedById(shareId: string): Promise<AccessGrantType> {

        if (!shareId) throw new Error('Share ID is required!');

        const grant = await this.accessGrantRepo.findOne({
            where: { id: shareId, is_revoked: false },
            relations: ['doctor', 'patient']
        });
        if (!grant) throw new Error('No share found with this ID!');

        const measurements = await this.healthMeasurementRepo.find({
            where: { id: In(grant.measurement_ids) },
            relations: ['patient', 'measurement_unit', 'medical_document']
        });
        grant['measurements'] = measurements;
        return grant;
    }

    async getSharedByCode(accessCode: string): Promise<AccessGrantType> {
        if (!accessCode) throw new Error('Access code is required!');

        const grant = await this.accessGrantRepo.findOne({
            where: { access_token: accessCode, is_revoked: false },
            relations: ['doctor', 'patient']
        });
        if (!grant) throw new Error('No share found with this code!');

        const measurements = await this.healthMeasurementRepo.find({
            where: { id: In(grant.measurement_ids) },
            relations: ['patient', 'measurement_unit', 'medical_document']
        });
        grant['measurements'] = measurements;
        return grant;
    }

    async getSharedMeasurements(shareId: string): Promise<HealthMeasurementType[]> {
        if (!shareId) throw new Error('Share ID is required!');

        const grant = await this.accessGrantRepo.findOne({
            where: { id: shareId, is_revoked: false },
            relations: ['doctor', 'patient']
        });

        if (!grant) throw new Error('No share found with this ID!');

        return await this.healthMeasurementRepo.find({
            where: { id: In(grant.measurement_ids) },
            relations: ['patient', 'measurement_unit', 'medical_document']
        });
    }

    async revokeShare(patientId: string, shareId: string): Promise<AccessGrantType> {
        if (!patientId || !shareId) throw new Error('Patient ID and Share ID are required!');

        const share = await this.accessGrantRepo.findOne({
            where: { id: shareId, patient_id: patientId }
        });

        if (!share) {
            throw new NotFoundException('Share not found or you do not have permission to revoke it');
        }

        share.is_revoked = true;
        return await this.accessGrantRepo.save(share);
    }

    async hasAccess(doctorId: string, patientId: string, measurementId?: string): Promise<boolean> {
        if (!doctorId || !patientId) throw new Error('Doctor ID and Patient ID are required!');

        const query = this.accessGrantRepo.createQueryBuilder('grant')
            .where('grant.doctor_id = :doctorId', { doctorId })
            .andWhere('grant.patient_id = :patientId', { patientId })
            .andWhere('grant.is_revoked = false')
            .andWhere('grant.expires_at > :now', { now: new Date() });

        if (measurementId) {
            query.andWhere(':measurementId = ANY(grant.measurement_ids) OR grant.measurement_ids IS NULL', { measurementId });
        }

        const count = await query.getCount();
        return count > 0;
    }
}
