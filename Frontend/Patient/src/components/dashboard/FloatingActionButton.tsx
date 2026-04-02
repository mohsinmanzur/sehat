import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';
import { router } from 'expo-router';

export const FloatingActionButton: React.FC = () => {
  const { theme } = useTheme()

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.primary, shadowColor: theme.primary },
        pressed && { transform: [{ scale: 0.95 }] }
      ]}
      onPress={() => { router.push('/health_measurements/addNew') }}
    >
      <Ionicons name="add" size={32} color={theme.backgroundDark} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    width: 53,
    height: 53,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 999,
  },
});
