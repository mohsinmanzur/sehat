import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import type { Patient } from '../types/types';
import { getObject, removeValue } from 'src/services/Storage/storage.service';
import backend from 'src/services/Backend/backend.service';
import { router } from 'expo-router';
import { useDatabase } from './DatabaseContext';
import { useNetwork } from './NetworkContext';
import { upsertPatient } from '../services/Database/patient.repository';
import { syncAllForPatient } from '../services/Sync/sync.service';
import { drainMutationQueue } from '../services/Sync/mutation.service';

interface UserContextValue {
    currentPatient: Patient | null;
    setCurrentPatient: (p: Patient | null) => void;
    isInitialized: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const { db } = useDatabase();
    const { isOnline, isDeviceOnly } = useNetwork();
    const prevOnlineRef = useRef(false);

    useEffect(() => {
        backend.setOnLogout(() => {
            setCurrentPatient(null);
            removeValue('currentPatient');
            router.replace('/(auth)/Login');
        });

        const loadCurrentPatient = async () => {
            setIsInitialized(false);
            try {
                const patient = await getObject<Patient | null>('currentPatient');
                if (patient) {
                    setCurrentPatient(patient);
                    if (db) {
                        upsertPatient(db, patient).catch(() => {});
                        if (isOnline && !isDeviceOnly) {
                            syncAllForPatient(db, patient.id!).catch(() => {});
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load patient from storage:', error);
            } finally {
                setIsInitialized(true);
            }
        };
        loadCurrentPatient();
    }, [db]);

    // Trigger sync and queue drain when device comes back online
    useEffect(() => {
        if (isOnline && !prevOnlineRef.current && !isDeviceOnly && currentPatient?.id && db) {
            drainMutationQueue(db, currentPatient.id).catch(() => {});
            syncAllForPatient(db, currentPatient.id).catch(() => {});
        }
        prevOnlineRef.current = isOnline;
    }, [isOnline, isDeviceOnly, currentPatient?.id, db]);

    return (
        <UserContext.Provider value={{ currentPatient, setCurrentPatient, isInitialized }}>
            {children}
        </UserContext.Provider>
    );
};

export const useCurrentPatient = (): UserContextValue => {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error('useCurrentPatient must be used within a UserProvider');
    }
    return ctx;
};
