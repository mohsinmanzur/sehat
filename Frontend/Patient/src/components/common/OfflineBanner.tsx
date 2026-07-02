import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../../context/NetworkContext';
import { useTheme } from '../../context/ThemeContext';

export const OfflineBanner: React.FC = () => {
    const { isOnline } = useNetwork();
    const { theme } = useTheme();

    if (isOnline) return null;

    return (
        <View style={[styles.banner, { backgroundColor: theme.warning + '22', borderColor: theme.warning }]}>
            <Text style={[styles.text, { color: theme.textGray }]}>
                Offline — showing cached data
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
