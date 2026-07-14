import { ActivityIndicator, StyleSheet } from 'react-native'
import React from 'react'
import { ThemedView } from './ThemedView';
import { useTheme } from 'src/context/ThemeContext';

const LoadingScreen = () => {
    const { theme } = useTheme();
    return (
        <ThemedView style={ { ...StyleSheet.absoluteFillObject, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.backgroundDark }}>
            <ActivityIndicator size="large" color={theme.primary} />
        </ThemedView>
    )
}

export default LoadingScreen