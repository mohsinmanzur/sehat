import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Access_Grant } from '../entities/access_grant.entity';
import { Repository } from 'typeorm';
import { ShareMeasurementDto } from './dto/share-measurement.dto';
import { DoctorService } from '../doctor/doctor.service';
import { AccessGrantType } from './types/access_grant.type';
import { Doctor } from 'src/entities/doctor.entity';

@Injectable()
export class ShareService {
    constructor(
        @InjectRepository(Access_Grant)
        private accessGrantRepo: Repository<Access_Grant>,
        private doctorService: DoctorService
    ) { }

    async shareMeasurement(patientId: string, shareDto: ShareMeasurementDto): Promise<AccessGrantType | null> {
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
        return await this.accessGrantRepo.find({
            where: { patient_id: patientId, is_revoked: false },
            relations: ['doctor', 'patient']
        });
    }

    async revokeShare(patientId: string, shareId: string): Promise<AccessGrantType> {
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
