import * as SQLite from 'expo-sqlite';
import type { MedicalDocument } from '../../types/types';

export async function upsertDocuments(
    db: SQLite.SQLiteDatabase,
    docs: MedicalDocument[],
    patientId?: string
): Promise<void> {
    for (const doc of docs) {
        const pid = patientId ?? (doc.patient?.id ?? null);
        await db.runAsync(
            `INSERT INTO medical_documents
                (id, patient_id, file_name, file_url, local_file_path, record_type,
                 ocr_extracted_text, date_issued, synced_at)
             VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                 patient_id = excluded.patient_id,
                 file_name = excluded.file_name,
                 file_url = excluded.file_url,
                 local_file_path = COALESCE(medical_documents.local_file_path, excluded.local_file_path),
                 record_type = excluded.record_type,
                 ocr_extracted_text = excluded.ocr_extracted_text,
                 date_issued = excluded.date_issued,
                 synced_at = excluded.synced_at`,
            [
                doc.id ?? '',
                pid,
                doc.file_name ?? null,
                doc.file_url ?? null,
                doc.record_type ?? null,
                doc.ocr_extracted_text ?? null,
                doc.date_issued ? new Date(doc.date_issued).toISOString() : null,
                new Date().toISOString(),
            ]
        );
    }
}

export async function getDocumentById(
    db: SQLite.SQLiteDatabase,
    id: string
): Promise<(MedicalDocument & { local_file_path?: string }) | null> {
    const row = await db.getFirstAsync<Record<string, unknown>>(
        'SELECT * FROM medical_documents WHERE id = ?',
        [id]
    );
    if (!row) return null;
    return rowToDocument(row);
}

export async function getDocumentsByPatient(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<(MedicalDocument & { local_file_path?: string })[]> {
    const rows = await db.getAllAsync<Record<string, unknown>>(
        'SELECT * FROM medical_documents WHERE patient_id = ?',
        [patientId]
    );
    return rows.map(rowToDocument);
}

export async function insertLocalDocument(
    db: SQLite.SQLiteDatabase,
    localId: string,
    localFilePath: string,
    patientId: string,
    recordType: MedicalDocument['record_type'],
    ocrText?: string
): Promise<void> {
    await db.runAsync(
        `INSERT INTO medical_documents
            (id, patient_id, file_name, file_url, local_file_path, record_type, ocr_extracted_text, synced_at)
         VALUES (?, ?, NULL, NULL, ?, ?, ?, NULL)`,
        [localId, patientId, localFilePath, recordType, ocrText ?? null]
    );
}

export async function updateLocalFilePath(
    db: SQLite.SQLiteDatabase,
    id: string,
    localFilePath: string
): Promise<void> {
    await db.runAsync(
        'UPDATE medical_documents SET local_file_path = ? WHERE id = ?',
        [localFilePath, id]
    );
}

export async function reconcileLocalDocument(
    db: SQLite.SQLiteDatabase,
    localId: string,
    serverId: string,
    serverDoc: MedicalDocument,
    patientId: string
): Promise<void> {
    const existingPath = await db.getFirstAsync<{ local_file_path: string | null }>(
        'SELECT local_file_path FROM medical_documents WHERE id = ?',
        [localId]
    );
    await db.runAsync('DELETE FROM medical_documents WHERE id = ?', [localId]);
    await upsertDocuments(db, [serverDoc], patientId);
    if (existingPath?.local_file_path) {
        await updateLocalFilePath(db, serverId, existingPath.local_file_path);
    }
}

export async function deleteDocumentIfOrphaned(
    db: SQLite.SQLiteDatabase,
    documentId: string
): Promise<string | null> {
    const referenced = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM health_measurements WHERE document_id = ?',
        [documentId]
    );
    if ((referenced?.count ?? 0) > 0) return null;

    const doc = await db.getFirstAsync<{ local_file_path: string | null }>(
        'SELECT local_file_path FROM medical_documents WHERE id = ?',
        [documentId]
    );
    await db.runAsync('DELETE FROM medical_documents WHERE id = ?', [documentId]);
    return doc?.local_file_path ?? null;
}

function rowToDocument(row: Record<string, unknown>): MedicalDocument & { local_file_path?: string } {
    return {
        id: row.id as string,
        patient: { id: row.patient_id as string } as MedicalDocument['patient'],
        file_name: (row.file_name as string) ?? '',
        file_url: (row.file_url as string) ?? '',
        local_file_path: (row.local_file_path as string) ?? undefined,
        record_type: (row.record_type as MedicalDocument['record_type']) ?? 'other',
        ocr_extracted_text: (row.ocr_extracted_text as string) ?? undefined,
        date_issued: row.date_issued ? new Date(row.date_issued as string) : undefined,
    };
}
