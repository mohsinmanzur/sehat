import { Animated } from "react-native";

export const errorShakeAnimation = (shakeAnimation) => (
    Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start()
)