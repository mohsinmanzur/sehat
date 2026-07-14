import { StyleSheet, TextInput, TextInputProps } from 'react-native'
import React from 'react'
import { useTheme } from 'src/context/ThemeContext';

export const ThemedTextInput = ({ style, ...props }: TextInputProps) => {

  const { theme } = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.textVeryLight}
      style = {[{
        backgroundColor: theme.card,
        color: theme.textGray,
        borderRadius: 6,
        paddingHorizontal: 15,
        paddingVertical: 12,
        width: '80%',
        fontFamily: 'PublicSans_600SemiBold',
        fontSize: 15
      },
      style]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({})