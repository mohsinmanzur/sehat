import React from 'react'
import { Pressable } from 'react-native'
import { ThemedText } from './ThemedText'
import { Link, LinkProps } from 'expo-router'

export const ThemedLink = ({style, children, ...props}: LinkProps) => {
    return (
        <Link {...props} asChild>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
            <ThemedText style={[{
                marginTop: 10,
                textDecorationLine: 'underline'
                },
                style]}>
            {children}
            </ThemedText>
        </Pressable>
        </Link>
    )
}