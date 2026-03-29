import { PartialType } from '@nestjs/mapped-types';
import { CreateReferenceRangeDto } from './create-referencerange.dto';

export class UpdateReferenceRangeDto extends PartialType(CreateReferenceRangeDto) {}
