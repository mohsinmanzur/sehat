import { Measurement_Unit } from '../../entities/measurement_unit.entity';
import { Patient } from '../../entities/patient.entity';
import { Medical_Document } from '../../entities/medical_document.entity';

export type GetHealthMeasurement = {
    id: string;
    numeric_value: number;
    created_at: Date;
    updated_at: Date;
    patient: Patient;
    measurement_unit: Measurement_Unit;
    medical_document: Medical_Document | null;
};