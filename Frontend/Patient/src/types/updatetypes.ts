import { HealthMeasurement, Patient, MeasurementUnit, ReferenceRange } from "./types";

export type UpdatePatient = Partial<Patient>;

export type UpdateHealthMeasurement = Partial<HealthMeasurement> & {
    patient_id?: string;
    unit_id?: string;
    document_id?: string;
};

export type UpdateMeasurementUnit = Partial<MeasurementUnit>;

export type UpdateReferenceRange = Partial<ReferenceRange>;
