import { View, ViewProps, StyleSheet } from 'react-native'
import React from 'react'
import { useTheme } from 'src/context/ThemeContext';

export const ThemedCard = ({ style, ...props }: ViewProps) => {
    const { theme } = useTheme();
  return (
    <View style = {[{
        backgroundColor: theme.card,
        ...styles.card
    },
    style]} {...props} />
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 7,
    padding: 15
  }
})