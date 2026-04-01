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

    // Raw fields from the database for the frontend to compute status
    anomaly_detected: boolean;
    severity_score: number;
    min_value: number;
    max_value: number;
};