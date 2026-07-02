import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { openAndInitDatabase } from '../services/Database/database.service';

interface DatabaseContextValue {
    db: SQLite.SQLiteDatabase | null;
    isDbReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue>({ db: null, isDbReady: false });

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [isDbReady, setIsDbReady] = useState(false);

    useEffect(() => {
        openAndInitDatabase()
            .then(database => {
                setDb(database);
                setIsDbReady(true);
            })
            .catch(err => {
                console.error('Failed to open database:', err);
                setIsDbReady(true); // allow app to continue without DB
            });
    }, []);

    return (
        <DatabaseContext.Provider value={{ db, isDbReady }}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = (): DatabaseContextValue => useContext(DatabaseContext);
