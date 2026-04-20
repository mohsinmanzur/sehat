import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';
import { GhostElement } from 'src/components/GhostElement';

export const SkeletonCard = () => {
  const { theme } = useTheme();

  return (
    <GhostElement style={styles.card}>
        {/* Placeholder for Icon */}
        <View style={[styles.skeletonIcon, { backgroundColor: theme.backgroundDark }]} />
        
        {/* Placeholder for Data Rows */}
        <View style={styles.content}>
            <View style={[styles.skeletonTextFat, { backgroundColor: theme.backgroundDark }]} />
            <View style={[styles.skeletonTextThin, { backgroundColor: theme.backgroundDark }]} />
        </View>
    </GhostElement>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 160,          // Approximate height of your UpdatedMeasurementCard
    borderRadius: 16,
    padding: 16,
  },
  skeletonIcon: {
    height: 48,
    width: 48,
    borderRadius: 24,
    marginBottom: 40,
    opacity: 0.5,
  },
  content: {
    gap: 8,
  },
  skeletonTextFat: {
    height: 20,
    width: '70%',
    borderRadius: 6,
    opacity: 0.5,
  },
  skeletonTextThin: {
    height: 14,
    width: '40%',
    borderRadius: 4,
    opacity: 0.5,
  },
});