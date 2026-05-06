import { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Pressable, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { ThemedButton, ThemedText, ThemedView } from "src/components";
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@context/ThemeContext';
import { Colors } from '@theme/colors';
import Svg, { Defs, Rect, Mask } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-snackbar';

const { width: SCREEN_W } = Dimensions.get('window');
const SQUARE_SIZE = SCREEN_W * 0.72; // 72% of screen width

export default function ScanQR() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isActive, setIsActive] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);
    const [torchOn, setTorchOn] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const successAnim = useRef(new Animated.Value(0)).current;

    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = styleSheet(theme, insets);

    // Hint text fade out
    useEffect(() => {
        if (isActive) {
            fadeAnim.setValue(1);
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 800,
                delay: 2000,
                useNativeDriver: true,
            }).start();
        }
    }, [isActive, fadeAnim]);

    // Scan line animation — loops vertically inside the square
    useEffect(() => {
        if (!isActive || hasScanned) return;

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [isActive, hasScanned, scanLineAnim]);

    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    useFocusEffect(
        useCallback(() => {
            setIsActive(true);
            setHasScanned(false);
            return () => setIsActive(false);
        }, [])
    );

    const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
        if (hasScanned) return;
        setHasScanned(true);

        // Flash success animation
        Animated.sequence([
            Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(successAnim, { toValue: 0, duration: 400, delay: 600, useNativeDriver: true }),
        ]).start();

        // Pass the scanned QR data back and navigate away
        Snackbar.show({
            text: `QR Scanned!`,
            duration: Snackbar.LENGTH_SHORT,
            backgroundColor: theme.primarySoft,
            textColor: theme.primary,
        });

        // Navigate to SharedDetail with the scanned access token
        setTimeout(() => {
            router.back();
        }, 800);
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <ThemedView safe style={styles.container}>
                <ThemedText style={styles.message}>We need your permission to use the camera</ThemedText>
                <ThemedButton
                    style={{ alignSelf: 'center' }}
                    onPress={requestPermission}
                >
                    <ThemedText>Grant Permission</ThemedText>
                </ThemedButton>
            </ThemedView>
        );
    }

    const scanLineTranslateY = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SQUARE_SIZE - 4],
    });

    const successOpacity = successAnim;

    return (
        <CameraView
            style={styles.camera}
            facing="back"
            enableTorch={torchOn}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={hasScanned ? undefined : handleBarCodeScanned}
        >
            {/* ── Dark overlay with square cutout ── */}
            <View style={StyleSheet.absoluteFill}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <Mask id="qrmask" x="0" y="0" height="100%" width="100%">
                            <Rect height="100%" width="100%" fill="#fff" />
                            {/* Square hole */}
                            <Rect
                                x={(SCREEN_W - SQUARE_SIZE) / 2}
                                y="20%"
                                width={SQUARE_SIZE}
                                height={SQUARE_SIZE}
                                rx={20}
                                fill="#000"
                            />
                        </Mask>
                    </Defs>
                    <Rect
                        height="100%"
                        width="100%"
                        fill="rgba(0, 0, 0, 0.65)"
                        mask="url(#qrmask)"
                    />
                </Svg>
            </View>

            {/* ── Viewfinder overlay ── */}
            <View style={styles.viewfinderWrapper}>
                <View style={styles.viewfinder}>

                    {/* Animated scan line */}
                    {!hasScanned && (
                        <Animated.View
                            style={[
                                styles.scanLine,
                                { transform: [{ translateY: scanLineTranslateY }] }
                            ]}
                        />
                    )}

                    {/* Success flash */}
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFillObject,
                            styles.successFlash,
                            { opacity: successOpacity }
                        ]}
                    />

                    {/* Corner brackets */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>

                {/* Hint text below the square */}
                <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
                    <ThemedText style={styles.hintText}>Point your camera at a QR code</ThemedText>
                </Animated.View>
            </View>

            {/* ── Top bar: close + torch ── */}
            <Pressable
                onPress={router.back}
                style={({ pressed }) => [styles.crossButton, { opacity: pressed ? 0.5 : 1 }]}
            >
                <Ionicons name="close" size={32} color="#FFFFFF" />
            </Pressable>

            <TouchableOpacity
                style={styles.torchButton}
                onPress={() => setTorchOn(prev => !prev)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={torchOn ? 'flash' : 'flash-outline'}
                    size={26}
                    color={torchOn ? theme.primary : '#FFFFFF'}
                />
            </TouchableOpacity>

            {/* ── Label at the very top ── */}
            <View style={styles.topLabel}>
                <ThemedText style={styles.topLabelText}>Scan QR Code</ThemedText>
            </View>

            {/* ── Re-scan button shown after a scan ── */}
            {hasScanned && (
                <View style={styles.rescanContainer}>
                    <TouchableOpacity
                        style={[styles.rescanButton, { backgroundColor: theme.primary }]}
                        onPress={() => setHasScanned(false)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.rescanText}>Scan Again</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </CameraView>
    );
}

const styleSheet = (theme: typeof Colors.dark, insets: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundDark,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 30,
    },
    camera: {
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
    },
    // Viewfinder sits centred in the screen
    viewfinderWrapper: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '20%',
    },
    viewfinder: {
        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
        overflow: 'hidden',
        borderRadius: 20,
    },
    scanLine: {
        position: 'absolute',
        left: 8,
        right: 8,
        height: 2.5,
        borderRadius: 2,
        backgroundColor: theme.primary,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 4,
    },
    successFlash: {
        borderRadius: 20,
        backgroundColor: 'rgba(0, 230, 118, 0.25)',
    },
    corner: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderColor: '#FFFFFF',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 20,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 20,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 20,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 20,
    },
    hintText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        opacity: 0.85,
    },
    crossButton: {
        position: 'absolute',
        top: insets.top + 9,
        left: 16,
    },
    torchButton: {
        position: 'absolute',
        top: insets.top + 9,
        right: 16,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topLabel: {
        position: 'absolute',
        top: insets.top + 12,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    topLabelText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    rescanContainer: {
        position: 'absolute',
        bottom: insets.bottom + 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    rescanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
    },
    rescanText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
