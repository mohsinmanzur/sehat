import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalContextType {
    scannedImage: string | null;
    setScannedImage: (uri: string | null) => void;
    selectedReports: Set<string>;
    setSelectedReports: (ids: Set<string>) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [scannedImage, setScannedImage] = useState<string | null>(null);
    const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());

    return (
        <GlobalContext.Provider value={{ scannedImage, setScannedImage, selectedReports, setSelectedReports }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    return context;
};
