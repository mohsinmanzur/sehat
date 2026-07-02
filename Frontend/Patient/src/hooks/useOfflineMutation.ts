import { useState, useEffect, useCallback } from 'react';
import type { HealthMeasurement } from '../types/types';
import { useDatabase } from '../context/DatabaseContext';
import { useNetwork } from '../context/NetworkContext';
import backend from '../services/Backend/backend.service';
import {
    upsertMeasurements,
    insertLocalMeasurement,
    updateMeasurementLocal,
    deleteMeasurementLocal,
    isLocalMeasurement,
} from '../services/Database/measurements.repository';
import {
    enqueueMutation,
    removeMutationByLocalId,
    getPendingMutationCount,
} from '../services/Database/mutations.repository';

function generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function useOfflineMutation(patientId: string | undefined) {
    const { db } = useDatabase();
    const { isOnline, isDeviceOnly } = useNetwork();
    const canSync = isOnline && !isDeviceOnly;
    const [hasPendingMutations, setHasPendingMutations] = useState(false);

    const refreshPendingCount = useCallback(async () => {
        if (!db) return;
        const count = await getPendingMutationCount(db);
        setHasPendingMutations(count > 0);
    }, [db]);

    useEffect(() => {
        refreshPendingCount();
    }, [refreshPendingCount]);

    const createMeasurement = useCallback(async (
        data: Partial<HealthMeasurement>
    ): Promise<{ id: string; isLocal: boolean }> => {
        if (!db || !patientId) throw new Error('Database not ready');

        const measurementData = { ...data, patient_id: patientId };

        if (canSync) {
            const serverData = await backend.createHealthMeasurement(measurementData as HealthMeasurement);
            await upsertMeasurements(db, [serverData]);
            return { id: serverData.id, isLocal: false };
        }

        const localId = generateLocalId();
        await insertLocalMeasurement(db, { ...measurementData, local_id: localId });
        await enqueueMutation(db, {
            entity_type: 'health_measurement',
            operation: 'create',
            payload: JSON.stringify(measurementData),
            local_id: localId,
            server_id: null,
        });
        await refreshPendingCount();
        return { id: localId, isLocal: true };
    }, [db, patientId, canSync, refreshPendingCount]);

    const updateMeasurement = useCallback(async (
        id: string,
        fields: Partial<HealthMeasurement>
    ): Promise<void> => {
        if (!db) throw new Error('Database not ready');

        await updateMeasurementLocal(db, id, fields);

        if (canSync && !id.startsWith('local_')) {
            const serverData = await backend.updateHealthMeasurement(id, fields as any);
            await upsertMeasurements(db, [serverData]);
        } else {
            await enqueueMutation(db, {
                entity_type: 'health_measurement',
                operation: 'update',
                payload: JSON.stringify(fields),
                local_id: null,
                server_id: id,
            });
            await refreshPendingCount();
        }
    }, [db, canSync, refreshPendingCount]);

    const deleteMeasurement = useCallback(async (id: string): Promise<void> => {
        if (!db) throw new Error('Database not ready');

        const isLocal = await isLocalMeasurement(db, id);

        await deleteMeasurementLocal(db, id);

        if (isLocal) {
            // Never reached the server — cancel the pending create too
            await removeMutationByLocalId(db, id);
        } else if (canSync) {
            await backend.deleteHealthMeasurement(id);
        } else {
            await enqueueMutation(db, {
                entity_type: 'health_measurement',
                operation: 'delete',
                payload: '{}',
                local_id: null,
                server_id: id,
            });
            await refreshPendingCount();
        }
    }, [db, canSync, refreshPendingCount]);

    return { createMeasurement, updateMeasurement, deleteMeasurement, hasPendingMutations };
}
