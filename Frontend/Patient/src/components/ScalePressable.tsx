import React from "react";
import { Pressable, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

// A smooth "weight" bouncy button that shrinks organically when pressed
export const ScalePressable = React.forwardRef<View, any>((props, ref) => {
    const scale = useSharedValue(1);

    const handlePressIn = (e: any) => {
        scale.value = withTiming(0.95, { duration: 100 });
        if (props.onPressIn) props.onPressIn(e);
    };

    const handlePressOut = (e: any) => {
        scale.value = withTiming(1, { duration: 100 });
        //scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        if (props.onPressOut) props.onPressOut(e);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const { style, children, onPressIn: _opi, onPressOut: _opo, ...rest } = props;

    return (
        <Pressable
            {...rest}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            ref={ref as any}
        >
            <Animated.View style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
});