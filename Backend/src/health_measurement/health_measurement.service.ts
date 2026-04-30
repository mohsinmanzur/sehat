import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Measurement_Unit } from '../entities/measurement_unit.entity';
import { CreateMeasurementUnitDto } from './dto/create-unit.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Health_Measurement } from '../entities/health_measurement.entity';
import { Patient } from '../entities/patient.entity';
import { Medical_Document } from '../entities/medical_document.entity';
import { Repository } from 'typeorm';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { HealthMeasurementType } from './types/health_measurement.type';
import { Reference_Range } from '../entities/reference_range.entity';
import { ReferenceRangeType } from './types/reference_range.type';

@Injectable()
export class HealthMeasurementService {
    constructor(
        @InjectRepository(Health_Measurement) private healthMeasurementRepo: Repository<Health_Measurement>,
        @InjectRepository(Measurement_Unit) private measurementUnitRepo: Repository<Measurement_Unit>,
        @InjectRepository(Reference_Range) private referenceRangeRepo: Repository<Reference_Range>
    ) { }

    async getAllMeasurements(): Promise<HealthMeasurementType[] | null> {
        const measurements = await this.healthMeasurementRepo.find({
            relations: ['patient', 'measurement_unit', 'medical_document']
        });

        return measurements as unknown as HealthMeasurementType[];
    }

    async HealthMeasurementTypesByPatient(patient_id: string): Promise<HealthMeasurementType[]> {
        const measurements = await this.healthMeasurementRepo.find({
            where: { patient_id },
            relations: ['patient', 'measurement_unit', 'medical_document'],
            order: { created_at: 'DESC' }
        });

        return measurements as unknown as HealthMeasurementType[];
    }

    async getMeasurementById(id: string): Promise<HealthMeasurementType> {
        const measurement = await this.healthMeasurementRepo.findOne({
            where: { id },
            relations: ['patient', 'measurement_unit', 'medical_document']
        });

        return measurement as unknown as HealthMeasurementType;
    }

    async createHealthMeasurement(measurement: CreateMeasurementDto): Promise<HealthMeasurementType> {
        const newMeasurement = this.healthMeasurementRepo.create(measurement);
        const saved = await this.healthMeasurementRepo.save(newMeasurement);
        return await this.getMeasurementById(saved.id);
    }

    async updateHealthMeasurement(id: string, measurement: UpdateMeasurementDto): Promise<HealthMeasurementType> {
        const existingRecord = await this.healthMeasurementRepo.findOneBy({ id });
        if (!existingRecord) {
            throw new Error('Health measurement not found');
        }
        Object.assign(existingRecord, measurement);
        await this.healthMeasurementRepo.save(existingRecord);
        return await this.getMeasurementById(id);
    }

    async deleteHealthMeasurement(id: string): Promise<void> {
        await this.healthMeasurementRepo.delete(id);
    }

    async createUnit(unit: CreateMeasurementUnitDto): Promise<Measurement_Unit> {
        const newUnit = this.measurementUnitRepo.create(unit);
        return await this.measurementUnitRepo.save(newUnit);
    }

    async getUnits(): Promise<Measurement_Unit[]> {
        return await this.measurementUnitRepo.find();
    }

    async getReferenceRangesByUnit(unit_id: string): Promise<ReferenceRangeType[]> {
        const ranges = await this.referenceRangeRepo.find({
            where: { unit_id },
            relations: ['measurement_unit']
        });
        return ranges as unknown as ReferenceRangeType[];
    }

    async getAllReferenceRanges(): Promise<ReferenceRangeType[]> {
        const ranges = await this.referenceRangeRepo.find({
            relations: ['measurement_unit']
        });
        return ranges as unknown as ReferenceRangeType[];
    }
}