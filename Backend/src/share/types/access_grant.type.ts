import { Patient } from "../../entities/patient.entity";
import { Doctor } from "../../entities/doctor.entity";

export type AccessGrantType = {
    id: string;
    patient: Patient;
    doctor: Doctor;
    measurement_ids?: string[];
    permission: string;
    access_token: string;
    expires_at: Date;
    is_revoked: boolean;
}