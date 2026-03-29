import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MedicalDocumentService } from './medical_document.service';
import { Medical_Document } from 'src/entities/medical_document.entity';
import { CreateMedicalDocumentDto } from './dto/create-medicaldocument.dto';

@Controller('record')
export class MedicalDocumentController
{
  constructor(private readonly medicalDocumentService: MedicalDocumentService) {}

  @Get()
  async getRecord(
    @Query('id') id?: string,
    @Query('patient_id') patient_id?: string
  ): Promise<Medical_Document | Medical_Document[] | null>
  {
    if (id) return await this.medicalDocumentService.getRecordById(id);
    if (patient_id) return await this.medicalDocumentService.getRecordsByPatientId(patient_id);
    return await this.medicalDocumentService.getAllRecords();
  }

  @Post()
  async createRecord(@Body() body: CreateMedicalDocumentDto) : Promise<Medical_Document>
  {
    return await this.medicalDocumentService.createRecord(body);
  }
}
