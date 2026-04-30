import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Patient } from '../types/dtos';
import { getObject, removeValue } from 'src/services/Storage/storage.service';
import backend from 'src/services/Backend/backend.service';

import { router } from 'expo-router';

interface UserContextValue {
    currentPatient: Patient | null;
    setCurrentPatient: (p: Patient | null) => void;
    isInitialized: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

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
                }
            }
            catch (error) {
                console.error('Failed to load patient from storage:', error);
            }
            finally {
                setIsInitialized(true);
            }
        };
        loadCurrentPatient();
    }, []);

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
