import * as SQLite from 'expo-sqlite';
import type { Patient } from '../../types/types';
import { serializeJson, deserializeJson } from './database.service';

export async function upsertPatient(db: SQLite.SQLiteDatabase, patient: Patient): Promise<void> {
    await db.runAsync(
        `INSERT INTO patients
            (id, name, email, phone, date_of_birth, blood_group, gender,
             reward_points, is_research_opt_in, emergency_contacts,
             created_at, updated_at, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             email = excluded.email,
             phone = excluded.phone,
             date_of_birth = excluded.date_of_birth,
             blood_group = excluded.blood_group,
             gender = excluded.gender,
             reward_points = excluded.reward_points,
             is_research_opt_in = excluded.is_research_opt_in,
             emergency_contacts = excluded.emergency_contacts,
             created_at = excluded.created_at,
             updated_at = excluded.updated_at,
             synced_at = excluded.synced_at`,
        [
            patient.id ?? null,
            patient.name,
            patient.email,
            patient.phone ?? null,
            patient.date_of_birth ? new Date(patient.date_of_birth).toISOString() : null,
            patient.blood_group ?? null,
            patient.gender,
            patient.reward_points ?? 0,
            patient.is_research_opt_in ? 1 : 0,
            serializeJson(patient.emergency_contacts),
            patient.created_at ? new Date(patient.created_at).toISOString() : null,
            patient.updated_at ? new Date(patient.updated_at).toISOString() : null,
            new Date().toISOString(),
        ]
    );
}

export async function getPatientById(db: SQLite.SQLiteDatabase, id: string): Promise<Patient | null> {
    const row = await db.getFirstAsync<Record<string, unknown>>(
        'SELECT * FROM patients WHERE id = ?',
        [id]
    );
    if (!row) return null;
    return rowToPatient(row);
}

function rowToPatient(row: Record<string, unknown>): Patient {
    return {
        id: row.id as string,
        name: row.name as string,
        email: row.email as string,
        phone: (row.phone as string) ?? undefined,
        date_of_birth: row.date_of_birth ? new Date(row.date_of_birth as string) : new Date(),
        blood_group: (row.blood_group as string) ?? undefined,
        gender: (row.gender as Patient['gender']) ?? 'other',
        reward_points: (row.reward_points as number) ?? 0,
        is_research_opt_in: row.is_research_opt_in === 1,
        emergency_contacts: deserializeJson<Record<string, string>[]>(row.emergency_contacts as string) ?? undefined,
        created_at: row.created_at ? new Date(row.created_at as string) : undefined,
        updated_at: row.updated_at ? new Date(row.updated_at as string) : undefined,
    };
}
