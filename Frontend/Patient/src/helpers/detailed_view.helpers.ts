import { ReferenceRangeDTO } from "src/types/dto";
import { GetHealthMeasurement } from "../types/others";

export function buildSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
}

export function buildAreaPath(points: { x: number; y: number }[], bottom: number): string {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${bottom}`;
    d += ` L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    d += ` L ${points[points.length - 1].x} ${bottom} Z`;
    return d;
}

// ─── Format a date for chart x-axis labels ────────────────────────────────────
export function formatChartDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return `${day} ${month}`;
}

// ─── Trend title ──────────────────────────────────────────────────────────────
export function getTrendTitle(measurements: GetHealthMeasurement[]): string {
    if (measurements.length < 2) return 'Trend';
    const start = new Date(measurements[measurements.length - 1].created_at);
    const end = new Date(measurements[0].created_at);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const unit = diffDays <= 14 ? `${diffDays} Day` : diffDays <= 60 ? `${Math.round(diffDays / 7)} Week` : `${Math.round(diffDays / 30)} Month`;
    return `${unit} Trend`;
}

export const calculatePoints = (data: number[], width: number, height: number): string => {
    // Return empty if no data
    if (!data || data.length === 0) return "";

    // Draw a flat line in the middle if there is only 1 data point
    if (data.length === 1) return `0,${height / 2} ${width},${height / 2}`;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min; // Guard against division by zero if all values are identical

    return data.map((value, index) => {
        // Spread points evenly across the width
        const x = (index / (data.length - 1)) * width;

        // Scale the value to the height. (We subtract from height because SVG Y=0 is at the top)
        const y = height - ((value - min) / range) * height;

        return `${x},${y}`;
    }).join(" "); // Joins into an SVG readable format like "0,30 20,15 40,25"
};

export const findBestReferenceRange = (measurement: GetHealthMeasurement, referenceRanges: ReferenceRangeDTO[]): ReferenceRangeDTO | null => {
    if (!referenceRanges || referenceRanges.length === 0) return null;

    const patientAge = new Date().getFullYear() - new Date(measurement.patient.date_of_birth).getFullYear();

    let bestMatch: ReferenceRangeDTO | null = null;
    let highestScore = -Infinity;

    for (const range of referenceRanges) {
        let score = 0;

        // 1. Gender Match (Highest Priority)
        if (range.target_gender) {
            if (range.target_gender === measurement.patient.gender) {
                score += 10000;
            } else {
                continue; // Discard hard mismatches
            }
        } else {
            score += 1000; // Points for gender-neutral applicability
        }

        // 2 & 3. Age Match 
        const hasMinAge = range.min_age !== null && range.min_age !== undefined;
        const hasMaxAge = range.max_age !== null && range.max_age !== undefined;

        if ((hasMinAge && patientAge < range.min_age!) ||
            (hasMaxAge && patientAge > range.max_age!)) {
            continue; // Discard if patient falls completely outside required bounds
        }

        if (hasMinAge && hasMaxAge) {
            score += 1000; // Highly specific age range
        } else if (hasMinAge || hasMaxAge) {
            score += 500; // Partially specific
        } else {
            score += 100; // Unbounded general age range
        }

        // 4. Special Conditions Overlap
        const measurementConditions = measurement.special_conditions || [];
        const rangeConditions = range.special_conditions || [];

        const overlapCount = measurementConditions.filter((condition) =>
            rangeConditions.includes(condition)
        ).length;

        // Add weight for matching conditions
        score += overlapCount * 50;

        // Penalize if the range is meant for a special condition the measurement doesn't have
        if (rangeConditions.length > 0 && overlapCount === 0) {
            score -= 500;
        }

        // Evaluate against highest score
        if (score > highestScore) {
            highestScore = score;
            bestMatch = range;
        }
    }

    return bestMatch;
};