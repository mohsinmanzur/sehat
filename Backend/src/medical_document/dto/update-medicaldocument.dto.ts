import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalDocumentDto } from './create-medicaldocument.dto';

export class UpdateMedicalDocumentDto extends PartialType(CreateMedicalDocumentDto) {}
