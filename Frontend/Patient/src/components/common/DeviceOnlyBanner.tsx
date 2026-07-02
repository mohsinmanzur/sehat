import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface DeviceOnlyBannerProps {
    isDeviceOnly: boolean;
}

export const DeviceOnlyBanner: React.FC<DeviceOnlyBannerProps> = ({ isDeviceOnly }) => {
    const { theme } = useTheme();

    if (!isDeviceOnly) return null;

    return (
        <View style={[styles.banner, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
            <Text style={[styles.text, { color: theme.primary }]}>
                Device-only mode — data is not synced to cloud
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
    },
    text: {
        fontSize: 12,
        fontFamily: 'Lexend_600SemiBold',
    },
});
