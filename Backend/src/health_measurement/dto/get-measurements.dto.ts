import { Measurement_Unit } from 'src/entities/measurement_unit.entity';
import { Patient } from 'src/entities/patient.entity';
import { Medical_Document } from 'src/entities/medical_document.entity';

export type GetHealthMeasurement = {
    id: string;
    numeric_value: number;
    created_at: Date;
    updated_at: Date;
    patient: Patient;
    measurement_unit: Measurement_Unit;
    medical_document: Medical_Document | null;
};