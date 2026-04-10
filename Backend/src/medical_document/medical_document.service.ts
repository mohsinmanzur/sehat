import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medical_Document } from 'src/entities/medical_document.entity';
import { CreateMedicalDocumentDto } from './dto/create-medicaldocument.dto';
import { Repository } from 'typeorm';
import { BlobServiceClient, ContainerClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';
import sharp from 'sharp';

@Injectable()
export class MedicalDocumentService
{
    private containerClient: ContainerClient;
    
    constructor(@InjectRepository(Medical_Document) private medicalDocumentRepo: Repository<Medical_Document>)
    {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        const containerName = process.env.AZURE_CONTAINER_NAME;

        if (!connectionString || !containerName) {
        throw new Error('Azure Storage credentials are not configured.');
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        this.containerClient = blobServiceClient.getContainerClient(containerName);
    }

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

    async uploadImagetoAzure(file: Express.Multer.File, fileName: string): Promise<{ url: string }> {
    try
    {
      // 1. Convert image to WebP using Sharp
      // You can adjust the quality (0-100) to balance size and clarity
      const webpBuffer = await sharp(file.buffer)
        .webp({ quality: 80 }) 
        .toBuffer();

      // 2. Generate a unique filename
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);

      // 3. Upload to Azure
      await blockBlobClient.uploadData(webpBuffer, {
        blobHTTPHeaders: { 
          blobContentType: 'image/webp' 
        },
      });

      // Return the public URL (assuming your container allows public read access)
      return { url: blockBlobClient.url };

    }
    catch (error)
    {
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException('Failed to upload and process the image.');
    }
  }

  async getSecureImageUrl(fileUrl: string): Promise<string> {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
    const containerName = process.env.AZURE_CONTAINER_NAME as string;

    const urlObj = new URL(fileUrl);
    const blobName = decodeURIComponent(urlObj.pathname.split(`/${containerName}/`)[1]);
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const startsOn = new Date();
    startsOn.setMinutes(startsOn.getMinutes() - 5);

    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + 10);

    return await blobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('r'),
      startsOn: startsOn,
      expiresOn: expiresOn,
    });
  }
}