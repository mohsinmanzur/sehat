import { DashboardMeasurement } from "../types/others";

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
export function getTrendTitle(measurements: DashboardMeasurement[]): string {
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