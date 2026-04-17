import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Measurement_Unit } from 'src/entities/measurement_unit.entity';
import { CreateMeasurementUnitDto } from './dto/create-unit.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Health_Measurement } from 'src/entities/health_measurement.entity';
import { Reference_Range } from 'src/entities/reference_range.entity';
import { AI_Analysis } from 'src/entities/ai_analysis.entity';
import { Repository } from 'typeorm';
import { DashboardMeasurement } from './dto/get-measurements.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

@Injectable()
export class HealthMeasurementService {
    constructor(
        @InjectRepository(Health_Measurement) private healthMeasurementRepo: Repository<Health_Measurement>,
        @InjectRepository(Measurement_Unit) private measurementUnitRepo: Repository<Measurement_Unit>
    ) { }

    async getAllMeasurements(): Promise<Health_Measurement[] | null> {
        return await this.healthMeasurementRepo.find();
    }

    async getHealthMeasurementsByPatient(patient_id: string): Promise<DashboardMeasurement[]> {
        const rawResults = await this.healthMeasurementRepo.createQueryBuilder('hm')
            .leftJoin(Measurement_Unit, 'mu', 'hm.unit_id = mu.id')
            .leftJoin(Reference_Range, 'rr', 'hm.unit_id = rr.unit_id')
            .leftJoin(AI_Analysis, 'ai', 'hm.document_id = ai.document_id')
            .select([
                'hm.id AS id',
                'hm.numeric_value AS numeric_value',
                'hm.created_at AS created_at',
                'mu.unit_name AS unit_name',
                'mu.symbol AS symbol',
                'rr.special_condition AS special_condition',
                'rr.min_value AS min_value',
                'rr.max_value AS max_value',
                'ai.suggested_text AS ai_insight',
                'ai.severity_score AS severity_score',
                'ai.anomaly_detected AS anomaly_detected'
            ])
            .where('hm.patient_id = :patient_id', { patient_id })
            .orderBy('hm.created_at', 'ASC')
            .getRawMany();

        return rawResults.map(raw => {
            return {
                id: raw.id,
                numeric_value: Number(raw.numeric_value),
                unit: {
                    unit_name: raw.unit_name || 'Measurement',
                    symbol: raw.symbol || ''
                },
                created_at: raw.created_at,
                special_condition: raw.special_condition || 'GENERAL',
                ai_insight: raw.ai_insight || null,

                // Raw fields from the database for the frontend to compute status
                anomaly_detected: raw.anomaly_detected || false,
                severity_score: Number(raw.severity_score) || 0,
                min_value: Number(raw.min_value) || 0,
                max_value: Number(raw.max_value) || 0
            };
        });
    }

    async getHealthMeasurementById(id: string): Promise<Health_Measurement | null> {
        return await this.healthMeasurementRepo.findOneBy({ id });
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
