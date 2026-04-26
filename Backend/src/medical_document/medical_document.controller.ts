import { Body, Controller, FileTypeValidator, Get, InternalServerErrorException, MaxFileSizeValidator, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MedicalDocumentService } from './medical_document.service';
import { Medical_Document } from '../entities/medical_document.entity';
import { CreateMedicalDocumentDto } from './dto/create-medicaldocument.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';

@Controller('record')
export class MedicalDocumentController {
  constructor(
    private readonly medicalDocumentService: MedicalDocumentService,
  ) { }

  @Get()
  async getRecord(
    @Query('id') id?: string,
    @Query('patient_id') patient_id?: string
  ): Promise<Medical_Document | Medical_Document[] | null> {
    if (id) return await this.medicalDocumentService.getRecordById(id);
    if (patient_id) return await this.medicalDocumentService.getRecordsByPatientId(patient_id);
    return await this.medicalDocumentService.getAllRecords();
  }

  @Get('document-url')
  async getDocumentUrlFromMeasurementId(@Query('id') id: string): Promise<{ file_url: string }> {
    try {
      const file_url = await this.medicalDocumentService.getDocumentUrlFromMeasurementId(id);
      return { file_url };
    }
    catch (error) {
      throw new Error(`Failed to fetch document URL: ${error.message}`);
    }
  }

  @Post('image/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          //new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ]
      })
    ) file: Express.Multer.File,
    @Body() body: CreateMedicalDocumentDto
  ) {
    try {
      const fileName = `${body.record_type}_${uuidv4()}.webp`;
      const uploadedImage = await this.medicalDocumentService.uploadImagetoAzure(file, fileName);
      return await this.medicalDocumentService.createRecord({
        ...body,
        file_name: body.file_name ? body.file_name : fileName,
        file_url: uploadedImage.url
      });
    }
    catch (error) {
      console.error('Error uploading image:', error);
      throw new InternalServerErrorException(`Failed to upload image: ${error.message}`);
    }
  }

  @Post('image/get-secure-url')
  async getSecureImageUrl(@Body('file_url') fileUrl: string): Promise<{ file_url: string }> {
    return await this.medicalDocumentService.getSecureImageUrl(fileUrl);
  }
}
