import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';

interface GhostElementProps {
    style?: any;
    children?: React.ReactNode;
}

export const GhostElement: React.FC<GhostElementProps> = ({ style, children }) => {
    const { theme } = useTheme();
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
                Animated.timing(pulseAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
            ])
        ).start();
    }, [pulseAnim]);

    const backgroundColor = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.backgroundDark, theme.card],
    });

    return (
        <Animated.View style={[style, { backgroundColor }]}>
            {children}
        </Animated.View>
    );
};
