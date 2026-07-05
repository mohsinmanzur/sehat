import * as SQLite from 'expo-sqlite';
import backend from '../Backend/backend.service';
import { upsertMeasurements } from '../Database/measurements.repository';
import { upsertMeasurementUnits, upsertReferenceRanges } from '../Database/units.repository';
import { upsertAccessGrants } from '../Database/shares.repository';
import { upsertDocuments } from '../Database/documents.repository';
import { upsertPatient } from '../Database/patient.repository';
import { ensureLocalDocumentImages } from './image.service';

export async function syncAllForPatient(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    await syncDocuments(db, patientId);   // documents before measurements (measurement.document_id FK)
    await syncMeasurements(db, patientId); // syncs units/ranges first (measurement.unit_id FK)
    await syncShares(db, patientId);
}

export async function syncMeasurements(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    // Units and reference ranges are a priority — measurements FK-reference them and
    // they should always be available offline, so pull them before the measurements themselves.
    await syncUnitsAndRanges(db);
    try {
        const measurements = await backend.getMeasurementsByPatient(patientId);
        if (measurements?.length) {
            await upsertMeasurements(db, measurements);
        }
    } catch {
        // silently fail — offline data already in SQLite
    }
}

export async function syncUnitsAndRanges(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
        const [units, ranges] = await Promise.all([
            backend.getMeasurementUnits(),
            backend.getReferenceRanges(),
        ]);
        if (units?.length) await upsertMeasurementUnits(db, units);
        if (ranges?.length) await upsertReferenceRanges(db, ranges);
    } catch {
        // silently fail
    }
}

export async function syncShares(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    try {
        const grants = await backend.getPatientShares(patientId);
        if (grants) {
            await upsertAccessGrants(db, grants, patientId);
        }
    } catch {
        // silently fail
    }
}

export async function syncDocuments(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    try {
        const docs = await backend.getMedicalDocumentsByPatient(patientId);
        if (docs?.length) {
            await upsertDocuments(db, docs, patientId);
            await ensureLocalDocumentImages(db, docs);
        }
    } catch {
        // silently fail
    }
}

export async function syncPatientProfile(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    try {
        const patient = await backend.getPatientById(patientId);
        if (patient) await upsertPatient(db, patient);
    } catch {
        // silently fail
    }
}
