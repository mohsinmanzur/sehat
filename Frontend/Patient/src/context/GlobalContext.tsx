import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalContextType {
    // General variables to pass data between screens
    scannedImage: string | null;
    setScannedImage: (uri: string | null) => void;
    // You can add more global variables here later as needed
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [scannedImage, setScannedImage] = useState<string | null>(null);

    return (
        <GlobalContext.Provider value={{ scannedImage, setScannedImage }}>
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
