import React from "react";
import { Animated, Pressable, View } from "react-native";

// A smooth "weight" bouncy button that shrinks organically when pressed
export const ScalePressable = React.forwardRef<View, any>((props, ref) => {
    const scale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = (e: any) => {
        Animated.timing(scale, {
            toValue: 0.95,
            duration: 100, // Quick 100ms snap down
            useNativeDriver: true,
        }).start();
        if (props.onPressIn) props.onPressIn(e);
    };

    const handlePressOut = (e: any) => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 5,     // Adds a tiny bit more dampening
            tension: 120,    // High tension for a very quick snap-back
            useNativeDriver: true,
        }).start();
        if (props.onPressOut) props.onPressOut(e);
    };

    return (
        <Pressable
            {...props}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            ref={ref as any}
        >
            <Animated.View style={[props.style, { transform: [{ scale }] }]}>
                {props.children}
            </Animated.View>
        </Pressable>
    );
});