import * as SQLite from 'expo-sqlite';
import type { AccessGrant } from '../../types/types';
import { serializeJson, deserializeJson } from './database.service';

export async function upsertAccessGrants(
    db: SQLite.SQLiteDatabase,
    grants: AccessGrant[],
    patientId: string
): Promise<void> {
    for (const grant of grants) {
        await db.runAsync(
            `INSERT OR REPLACE INTO access_grants
                (id, patient_id, doctor_json, permission, is_revoked,
                 expires_at, created_at, access_token, measurement_ids, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                grant.id ?? '',
                patientId,
                serializeJson(grant.doctor),
                grant.permission,
                grant.is_revoked ? 1 : 0,
                grant.expires_at ? new Date(grant.expires_at).toISOString() : null,
                null,
                grant.access_token ?? null,
                serializeJson(grant.measurement_ids),
                new Date().toISOString(),
            ]
        );
    }
}

export async function getAccessGrantsByPatient(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<AccessGrant[]> {
    const rows = await db.getAllAsync<Record<string, unknown>>(
        'SELECT * FROM access_grants WHERE patient_id = ?',
        [patientId]
    );
    return rows.map(rowToGrant);
}

export async function deleteAccessGrant(
    db: SQLite.SQLiteDatabase,
    id: string
): Promise<void> {
    await db.runAsync('DELETE FROM access_grants WHERE id = ?', [id]);
}

function rowToGrant(row: Record<string, unknown>): AccessGrant {
    return {
        id: row.id as string,
        doctor: deserializeJson(row.doctor_json as string) ?? undefined,
        permission: row.permission as AccessGrant['permission'],
        is_revoked: row.is_revoked === 1,
        expires_at: row.expires_at ? new Date(row.expires_at as string) : undefined,
        access_token: (row.access_token as string) ?? undefined,
        measurement_ids: deserializeJson<string[]>(row.measurement_ids as string) ?? undefined,
    };
}
