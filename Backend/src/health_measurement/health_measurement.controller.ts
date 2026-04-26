import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { HealthMeasurementService } from './health_measurement.service';
import { CreateMeasurementUnitDto } from './dto/create-unit.dto';
import { Measurement_Unit } from '../entities/measurement_unit.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Health_Measurement } from '../entities/health_measurement.entity';
import { GetHealthMeasurement } from './dto/get-measurements.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { Reference_Range } from '../entities/reference_range.entity';

@Controller('health-measurement')
export class HealthMeasurementController {
  constructor(private readonly healthMeasurementService: HealthMeasurementService) { }

  @Get()
  async getHealthMeasurements(
    @Query('patient_id') patient_id?: string,
    @Query('id') id?: string
  ): Promise<GetHealthMeasurement[] | GetHealthMeasurement | Health_Measurement[] | null> {
    if (patient_id) {
      return await this.healthMeasurementService.getHealthMeasurementsByPatient(patient_id);
    }
    if (id) {
      return await this.healthMeasurementService.getMeasurementById(id);
    }
    return await this.healthMeasurementService.getAllMeasurements();
  }

  @Post()
  async createHealthMeasurement(@Body() measurement: CreateMeasurementDto): Promise<Health_Measurement> {
    return await this.healthMeasurementService.createHealthMeasurement(measurement);
  }

  @Put()
  async updateHealthMeasurement(@Query('id') id: string, @Body() measurement: UpdateMeasurementDto): Promise<Health_Measurement> {
    return await this.healthMeasurementService.updateHealthMeasurement(id, measurement);
  }

  @Delete()
  async deleteHealthMeasurement(@Query('id') id: string): Promise<void> {
    await this.healthMeasurementService.deleteHealthMeasurement(id);
  }

  @Post('unit')
  async createUnit(@Body() unit: CreateMeasurementUnitDto): Promise<Measurement_Unit> {
    return await this.healthMeasurementService.createUnit(unit);
  }

  @Get('unit')
  async getUnits(): Promise<Measurement_Unit[]> {
    return await this.healthMeasurementService.getUnits();
  }

  @Get('reference-ranges')
  async getReferenceRanges(@Query('unit_id') unit_id?: string): Promise<Reference_Range[] | null> {
    if (unit_id) {
      return await this.healthMeasurementService.getReferenceRangesByUnit(unit_id);
    }
    return await this.healthMeasurementService.getAllReferenceRanges();
  }
}
