import { Image, useColorScheme } from 'react-native'
import React from 'react'
import { useTheme } from 'src/context/ThemeContext'

const lightlogo = require('../../assets/logo-colored.png')
const darklogo = require('../../assets/logo-white.png')

export const ThemedLogo = ({...props}) => {
  
  const { mode } = useTheme();
  const systemColorScheme = useColorScheme();

  let finalMode = mode;

  if (mode === 'system') {
    finalMode = systemColorScheme;
  }

  const logo = finalMode === 'light' ? lightlogo: darklogo;
  return (
    <Image source= {logo} {...props}/>
  )
}