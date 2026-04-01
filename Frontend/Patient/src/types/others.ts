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

export type DashboardMeasurement = {
    id: string;
    numeric_value: number;
    unit: {
        unit_name: string;
        symbol: string;
    };
    created_at: string;

    special_condition: string;
    ai_insight?: string;

    anomaly_detected: boolean;
    severity_score: number;
    min_value: number;
    max_value: number;
};