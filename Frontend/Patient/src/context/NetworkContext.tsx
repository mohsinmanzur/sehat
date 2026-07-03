import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Snackbar } from 'react-native-snackbar';
import { getString, storeString } from '../services/Storage/storage.service';
import { useTheme } from './ThemeContext';

const DEVICE_ONLY_KEY = 'device_only_mode';

// Read by NetInfo's reachabilityShouldRun on every check; mutated whenever
// device-only mode toggles so the periodic reachability ping stops immediately.
let reachabilityPaused = false;
NetInfo.configure({ reachabilityShouldRun: () => !reachabilityPaused });

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
    const [isOnline, setIsOnline] = useState(false);
    const [isDeviceOnly, setIsDeviceOnlyState] = useState(false);
    const prevOnlineRef = useRef(false);
    const isDeviceOnlyRef = useRef(isDeviceOnly);
    const { theme } = useTheme();

    useEffect(() => {
        isDeviceOnlyRef.current = isDeviceOnly;
    }, [isDeviceOnly]);

    useEffect(() => {
        getString(DEVICE_ONLY_KEY).then(val => {
            if (val === 'true') {
                reachabilityPaused = true;
                setIsDeviceOnlyState(true);
            }
        }).catch(() => {});
    }, []);

    useEffect(() => {
        let hasInitialized = false;

        const handleState = (state: NetInfoState) => {
            const online = state.isConnected === true && state.isInternetReachable !== false;

            if (hasInitialized && !prevOnlineRef.current && online && !isDeviceOnlyRef.current) {
                Snackbar.show({
                    text: 'You\'re back online!',
                    duration: Snackbar.LENGTH_SHORT,
                    backgroundColor: theme.primarySoft,
                    textColor: theme.primary,
                });
            }

            prevOnlineRef.current = online;
            hasInitialized = true;
            setIsOnline(online);
        };

        NetInfo.fetch().then(handleState);

        const unsubscribe = NetInfo.addEventListener(handleState);

        return unsubscribe;
    }, [theme]);

    const setIsDeviceOnly = useCallback(async (value: boolean) => {
        await storeString(DEVICE_ONLY_KEY, value ? 'true' : 'false');
        reachabilityPaused = value;
        setIsDeviceOnlyState(value);
    }, []);

    return (
        <NetworkContext.Provider value={{ isOnline, isDeviceOnly, setIsDeviceOnly }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = (): NetworkContextValue => useContext(NetworkContext);
