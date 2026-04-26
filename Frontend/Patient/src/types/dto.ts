export type PatientDTO = {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    date_of_birth: Date;
    blood_group?: string;
    emergency_contacts?: Record<string, string>[];
    reward_points?: number;
    is_research_opt_in?: boolean;
    gender: 'male' | 'female' | 'other';
    created_at?: Date;
    updated_at?: Date;
};

export type DoctorDTO = {
    id?: string;
    name: string;
    email: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    license_number: string;
    associated_hospital?: string;
    specialization?: string;
    is_verified?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type MedicalDocumentDTO = {
    id?: string;
    patient_id: string;
    file_name: string;
    file_url: string;
    record_type: 'lab_report' | 'prescription' | 'imaging' | 'other';
    ocr_extracted_text?: string;
    date_issued?: Date;
    created_at?: Date;
    updated_at?: Date;
};

export type HealthMeasurementDTO = {
    id?: string;
    document_id?: string;
    patient_id: string;
    unit_id: string;
    numeric_value: number;
    created_at?: Date;
    updated_at?: Date;
};

export type UpdateHealthMeasurementDTO = {
    numeric_value?: number;
    created_at?: Date;
};

export type MeasurementUnitDTO = {
    id?: string;
    unit_name: string;
    symbol: string;
    measurement_group: string;
};

export type ReferenceRangeDTO = {
    id?: string;
    unit_id: string;
    min_value: number;
    max_value: number;
    target_gender?: 'male' | 'female' | 'other';
    min_age?: number;
    max_age?: number;
    special_conditions?: string[];
}

export type AIAnalysisDTO = {
    id?: string;
    document_id: string;
    anomaly_detected: boolean;
    suggested_text?: string;
    severity_score: number;
    created_at?: Date;
    updated_at?: Date;
}

export type AccessGrantDTO = {
    id?: string;
    doctor_id: string;
    patient_id: string;
    measurement_id?: string;
    access_token?: string;
    permission: 'view_only' | 'emergency' | 'full_access';
    is_revoked?: boolean;
    expires_at: Date;
}