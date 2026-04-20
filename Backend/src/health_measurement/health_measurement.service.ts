import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Measurement_Unit } from 'src/entities/measurement_unit.entity';
import { CreateMeasurementUnitDto } from './dto/create-unit.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Health_Measurement } from 'src/entities/health_measurement.entity';
import { Patient } from 'src/entities/patient.entity';
import { Medical_Document } from 'src/entities/medical_document.entity';
import { Repository } from 'typeorm';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { GetHealthMeasurement } from './dto/get-measurements.dto';

@Injectable()
export class HealthMeasurementService {
    constructor(
        @InjectRepository(Health_Measurement) private healthMeasurementRepo: Repository<Health_Measurement>,
        @InjectRepository(Measurement_Unit) private measurementUnitRepo: Repository<Measurement_Unit>
    ) { }

    async getAllMeasurements(): Promise<Health_Measurement[] | null> {
        return await this.healthMeasurementRepo.find();
    }

    async getHealthMeasurementsByPatient(patient_id: string): Promise<GetHealthMeasurement[]> {
        const measurements = await this.healthMeasurementRepo.createQueryBuilder('hm')
            .leftJoinAndMapOne('hm.patient', Patient, 'patient', 'hm.patient_id = patient.id')
            .leftJoinAndMapOne('hm.measurement_unit', Measurement_Unit, 'measurement_unit', 'hm.unit_id = measurement_unit.id')
            .leftJoinAndMapOne('hm.medical_document', Medical_Document, 'medical_document', 'hm.document_id = medical_document.id')
            .where('hm.patient_id = :patient_id', { patient_id })
            .orderBy('hm.created_at', 'DESC')
            .getMany();

        return measurements.map((m: any) => {
            const { patient_id, unit_id, document_id, ...rest } = m;
            return rest as GetHealthMeasurement;
        });
    }

    async getHealthMeasurementById(id: string): Promise<GetHealthMeasurement | null> {
        const measurement = await this.healthMeasurementRepo.createQueryBuilder('hm')
            .leftJoinAndMapOne('hm.patient', Patient, 'patient', 'hm.patient_id = patient.id')
            .leftJoinAndMapOne('hm.measurement_unit', Measurement_Unit, 'measurement_unit', 'hm.unit_id = measurement_unit.id')
            .leftJoinAndMapOne('hm.medical_document', Medical_Document, 'medical_document', 'hm.document_id = medical_document.id')
            .where('hm.id = :id', { id })
            .getOne();

        if (!measurement) return null;

        const { patient_id, unit_id, document_id, ...rest } = measurement as any;
        return rest as GetHealthMeasurement;
    }

    async createHealthMeasurement(measurement: CreateMeasurementDto): Promise<Health_Measurement> {
        const createdRecord = this.healthMeasurementRepo.create(measurement);
        return await this.healthMeasurementRepo.save(createdRecord);
    }

    async updateHealthMeasurement(measurement: UpdateMeasurementDto): Promise<Health_Measurement> {
        const existingRecord = await this.healthMeasurementRepo.findOneBy({ id: measurement.id });
        if (!existingRecord) {
            throw new Error('Health measurement not found');
        }
        Object.assign(existingRecord, measurement);
        return await this.healthMeasurementRepo.save(existingRecord);
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
}
