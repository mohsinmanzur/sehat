import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medical_Document } from 'src/entities/medical_document.entity';
import { CreateMedicalDocumentDto } from './dto/create-medicaldocument.dto';
import { Repository } from 'typeorm';

@Injectable()
export class MedicalDocumentService
{
    constructor(@InjectRepository(Medical_Document) private medicalDocumentRepo: Repository<Medical_Document>) {}

    async getAllRecords() : Promise<Medical_Document[] | null>
    {
        return await this.medicalDocumentRepo.find();
    }

    async getRecordsByPatientId(id: string) : Promise<Medical_Document[] | null>
    {
        return await this.medicalDocumentRepo.find({ where: { patient_id: id } });
    }

    async getRecordById(id: string) : Promise<Medical_Document | null>
    {
        return await this.medicalDocumentRepo.findOne({ where: { id } });
    }

    async createRecord(body: CreateMedicalDocumentDto) : Promise<Medical_Document>
    {
        const rec = this.medicalDocumentRepo.create(body);
        return await this.medicalDocumentRepo.save(rec);
    }
}
