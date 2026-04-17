import React from "react";
import { Pressable, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ScalePressable = React.forwardRef<View, any>((props, ref) => {
    const scale = useSharedValue(1);

    const handlePressIn = (e: any) => {
        scale.value = withTiming(0.95, { duration: 100 });
        if (props.onPressIn) props.onPressIn(e);
    };

    const handlePressOut = (e: any) => {
        scale.value = withTiming(1, { duration: 100 });

        if (props.onPressOut) props.onPressOut(e);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const { style, children, onPressIn: _opi, onPressOut: _opo, ...rest } = props;

    return (
        <AnimatedPressable
            {...rest}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            ref={ref as any}
            style={[style, animatedStyle]}
        >
            {children}
        </AnimatedPressable>
    );
});