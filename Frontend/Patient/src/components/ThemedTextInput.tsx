import { StyleSheet, TextInput, TextInputProps, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/colors';

export const ThemedTextInput = ({ style, ...props }: TextInputProps) => {

  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

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