export const bloodGroups = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
]

export type UploadMedicalDocument = {
    id?: string;
    patient_id: string;
    file_name?: string;
    record_type: 'lab_report' | 'prescription' | 'imaging' | 'other';
    ocr_extracted_text?: string;
    date_issued?: Date;
    created_at?: Date;

    file: string;

}

export type GetHealthMeasurement = {
    id: string;
    numeric_value: number;
    created_at: string;
    updated_at: string;
    patient: {
        id: string;
        name: string;
        email: string;
        gender: string;
        phone: string;
        date_of_birth: string;
        blood_group: string;
    };
    measurement_unit: {
        id: string;
        unit_name: string;
        symbol: string;
        measurement_group: string;
    };
    medical_document: {
        id: string;
        patient_id: string;
        file_name: string;
        file_url: string;
        record_type: 'lab_report' | 'prescription' | 'imaging' | 'other';
        ocr_extracted_text: string;
        date_issued: string;
        created_at: string;
        updated_at: string;
    } | null;
};