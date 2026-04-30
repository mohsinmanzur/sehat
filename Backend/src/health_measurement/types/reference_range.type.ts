import { Measurement_Unit } from '../../entities/measurement_unit.entity';

export type ReferenceRangeType = {
    id: string;
    unit: Measurement_Unit;
    min_value: number;
    max_value: number;
    target_gender?: 'male' | 'female' | 'other';
    min_age?: number;
    max_age?: number;
    special_conditions?: string[];
}