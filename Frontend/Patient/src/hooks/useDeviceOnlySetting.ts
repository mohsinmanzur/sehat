import { useCallback } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useNetwork } from '../context/NetworkContext';
import { syncAllForPatient } from '../services/Sync/sync.service';
import { drainMutationQueue } from '../services/Sync/mutation.service';

export function useDeviceOnlySetting(patientId?: string) {
    const { db } = useDatabase();
    const { isOnline, isDeviceOnly, setIsDeviceOnly: setNetworkDeviceOnly } = useNetwork();

    const setIsDeviceOnly = useCallback(async (value: boolean) => {
        await setNetworkDeviceOnly(value);

        // When turning OFF device-only mode, drain queued mutations and pull fresh data
        if (!value && isOnline && patientId && db) {
            drainMutationQueue(db, patientId).catch(() => {});
            syncAllForPatient(db, patientId).catch(() => {});
        }
    }, [setNetworkDeviceOnly, isOnline, patientId, db]);

    return { isDeviceOnly, setIsDeviceOnly };
}
