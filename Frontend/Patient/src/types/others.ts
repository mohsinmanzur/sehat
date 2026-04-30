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