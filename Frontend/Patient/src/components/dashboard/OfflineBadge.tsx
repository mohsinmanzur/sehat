import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Snackbar } from 'react-native-snackbar';
import { router } from 'expo-router';
import { useTheme } from 'src/context/ThemeContext';
import { ScalePressable } from '../ScalePressable';
import { ThemedText } from '../ThemedText';
import { useNetwork } from 'src/context/NetworkContext';

export const OfflineBadge: React.FC = () => {
  const { theme } = useTheme();
  const { isDeviceOnly, isOnline } = useNetwork();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const attemptReconnect = async () => {
    if (isReconnecting) return;
    setIsReconnecting(true);
    try {
      const state = await NetInfo.refresh();
      const online = state.isConnected === true && state.isInternetReachable !== false;
      if (!online) {
        Snackbar.show({
          text: "Still offline. Check your connection and try again.",
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: theme.warningLight,
          textColor: theme.warning,
        });
      }
    } finally {
      setIsReconnecting(false);
    }
  };

  if (isDeviceOnly)
    return (
      <ScalePressable
        style={{ backgroundColor: theme.primarySoft, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 13, }}
        onPress={() => router.push('/profile')}
      >
        <Ionicons name="phone-portrait-outline" size={18} color={theme.primary} />
        <ThemedText type='h3' style={{ color: theme.primary, fontSize: 13 }}>Device Only</ThemedText>
      </ScalePressable>
    );

  if (!isOnline)
    return (
      <ScalePressable
        style={{ backgroundColor: theme.warningLight, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 13, }}
        onPress={attemptReconnect}
      >
        {isReconnecting ? (
          <ActivityIndicator size="small" color={theme.warning} />
        ) : (
          <Ionicons name="cloud-offline-outline" size={20} color={theme.warning} />
        )}
        <ThemedText type='h3' style={{ color: theme.warning, fontSize: 13 }}>Offline</ThemedText>
      </ScalePressable>
    );

  return null;
};
