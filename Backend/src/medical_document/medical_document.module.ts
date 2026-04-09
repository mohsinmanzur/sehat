import { Module } from '@nestjs/common';
import { MedicalDocumentService } from './medical_document.service';
import { MedicalDocumentController } from './medical_document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medical_Document } from 'src/entities/medical_document.entity';
import { HealthMeasurementModule } from 'src/health_measurement/health_measurement.module';

@Module({
  imports: [TypeOrmModule.forFeature([Medical_Document]), HealthMeasurementModule],
  controllers: [MedicalDocumentController],
  providers: [MedicalDocumentService],
})
export class MedicalDocumentModule {}
