import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getString, storeString } from '../services/Storage/storage.service';

const DEVICE_ONLY_KEY = 'device_only_mode';

interface NetworkContextValue {
    isOnline: boolean;
    isDeviceOnly: boolean;
    setIsDeviceOnly: (value: boolean) => Promise<void>;
}

const NetworkContext = createContext<NetworkContextValue>({
    isOnline: true,
    isDeviceOnly: false,
    setIsDeviceOnly: async () => {},
});

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [isDeviceOnly, setIsDeviceOnlyState] = useState(false);
    const prevOnlineRef = useRef(true);

    useEffect(() => {
        getString(DEVICE_ONLY_KEY).then(val => {
            if (val === 'true') setIsDeviceOnlyState(true);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        NetInfo.fetch().then((state: NetInfoState) => {
            const online = state.isConnected === true && state.isInternetReachable !== false;
            setIsOnline(online);
            prevOnlineRef.current = online;
        });

        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const online = state.isConnected === true && state.isInternetReachable !== false;
            prevOnlineRef.current = online;
            setIsOnline(online);
        });

        return unsubscribe;
    }, []);

    const setIsDeviceOnly = useCallback(async (value: boolean) => {
        await storeString(DEVICE_ONLY_KEY, value ? 'true' : 'false');
        setIsDeviceOnlyState(value);
    }, []);

    return (
        <NetworkContext.Provider value={{ isOnline, isDeviceOnly, setIsDeviceOnly }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = (): NetworkContextValue => useContext(NetworkContext);
