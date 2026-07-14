import { Dimensions, StyleSheet, View, Animated, Text } from "react-native";
import { ThemedLogo, ThemedText, ThemedView } from "src/components";
import { ScalePressable } from "src/components/ScalePressable";
import ReportsOrganized from "./ReportsOrganized";
import EasilySearch from "./EasilySearch";
import AIAnalysis from "./AIAnalysis";
import { useEffect, useRef } from "react";
import { router } from "expo-router/build/exports";
import { Colors } from "src/constants/colors";
import { useTheme } from "src/context/ThemeContext";
import { setStatusBarStyle } from "expo-status-bar";

export default function Index() {
    const { theme, setMode } = useTheme();
    const { width } = Dimensions.get('window');
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);
    const styles = stylesFunc(theme);

    const slides = [
        { id: '1', component: <ReportsOrganized theme={theme} /> },
        { id: '2', component: <EasilySearch theme={theme} /> },
        { id: '3', component: <AIAnalysis theme={theme} /> }
    ];

    useEffect(() => {
        setMode('light');
        setStatusBarStyle('dark', true);
    }, []);

    return (
        <ThemedView style={styles.container}>

            <ThemedLogo style={{ height: 90, resizeMode: "contain" }} />

            <View style={{ width: '100%', alignItems: 'center' }}>
                <Animated.FlatList
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false } // color/width interpolation requires false
                    )}
                    data={slides}
                    renderItem={({ item }) => <View style={{ width }}>{item.component}</View>}
                    keyExtractor={(item) => item.id}
                    ref={flatListRef}
                    style={{ flexGrow: 0 }}
                />

                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    {slides.map((_, index) => {
                        const dotWidth = scrollX.interpolate({
                            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                            outputRange: [7, 20, 7],
                            extrapolate: 'clamp',
                        });

                        const dotColor = scrollX.interpolate({
                            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                            outputRange: [theme.textVeryLight, theme.primary, theme.textVeryLight],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.dot,
                                    { width: dotWidth, backgroundColor: dotColor }
                                ]}
                            />
                        );
                    })}
                </View>
            </View>

            <View style={{ width: '100%', alignItems: 'center' }}>
                <ScalePressable
                    style={{
                        backgroundColor: theme.primary,
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        borderRadius: 15,
                        width: '90%',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={() => { router.push('(auth)/Login') }}
                >
                    <ThemedText style={{ color: '#FFFFFF', fontFamily: 'Lexend_500Medium', padding: 8 }}>Get Started</ThemedText>
                </ScalePressable>

                <Text style={{ textAlign: 'center', paddingHorizontal: 40, marginTop: 10 }}>
                    <ThemedText type={'default'} style={{ color: theme.textGray, fontSize: 12 }}>
                        By continuing, you agree to our{' '}
                    </ThemedText>
                    <ThemedText type={'default'} style={{ color: theme.primary, fontSize: 12, textDecorationLine: 'underline' }}>
                        Terms{'\u00A0'}of{'\u00A0'}Service
                    </ThemedText>
                    <ThemedText type={'default'} style={{ color: theme.textGray, fontSize: 12 }}>
                        {' '}and{' '}
                    </ThemedText>
                    <ThemedText type={'default'} style={{ color: theme.primary, fontSize: 12, textDecorationLine: 'underline' }}>
                        Privacy{'\u00A0'}Policy
                    </ThemedText>
                    .
                </Text>
            </View>

        </ThemedView>
    );
}

const stylesFunc = (theme: typeof Colors.dark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundDark,
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 60
    },
    dot: {
        height: 8,
        borderRadius: 5,
        marginHorizontal: 4,
    }
});