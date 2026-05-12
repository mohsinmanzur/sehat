import React, { useEffect, useState } from 'react';
import { useTheme } from 'src/context/ThemeContext';
import QRCodeStyled from 'react-native-qrcode-styled';
import { useCurrentPatient } from '@context/PatientContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View, InteractionManager, ActivityIndicator } from 'react-native';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@env';
import { router } from 'expo-router';
import { Snackbar } from 'react-native-snackbar';

export const QRCodeCard: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient();
    const insets = useSafeAreaInsets();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setIsReady(true);
        });

        const socket = io(API_BASE_URL);
        socket.on('connect', () => {
            console.log('Connected to socket');
            socket.emit('join-share-room', currentPatient?.id);
        });

        socket.on('share-received', (data) => {
            if (data && data.sharingId) {
                // Disconnect to clean up resources
                socket.disconnect();
                console.log(`Received Access to share: ${data.sharingId}`);
                onClose?.();
                router.navigate({ pathname: `/share/SharedDashboardScreen`, params: { sharingId: data.sharingId } });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [currentPatient?.id]);

    return (
        <View style={[styles.card, { backgroundColor: theme.backgroundLight, marginBottom: insets.bottom + 70 }]}>

            <Pressable onPress={onClose} hitSlop={16} style={styles.handleWrapper}>
                <View style={[styles.handle, { backgroundColor: theme.textVeryLight }]} />
            </Pressable>

            <Text style={[styles.title, { color: theme.text }]}>Your QR Code</Text>

            <Text style={[styles.subtitle, { color: theme.textLight }]}>
                Scan this code from someone's account to see their shared health reports.
            </Text>

            <View style={{ width: 250, height: 250, alignItems: 'center', justifyContent: 'center' }}>
                {isReady ? (
                    <QRCodeStyled
                        data={currentPatient?.id}
                        style={{ backgroundColor: theme.backgroundLight }}
                        padding={0}
                        pieceCornerType='rounded'
                        color={theme.text}
                        size={250}
                        pieceLiquidRadius={3}
                        outerEyesOptions={{ color: theme.primary, borderRadius: 20 }}
                        innerEyesOptions={{ color: theme.text, borderRadius: 5 }}
                    />
                ) : (
                    <ActivityIndicator size="large" color={theme.primary} style={{ margin: 100 }} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 32,
        paddingTop: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    handleWrapper: {
        paddingBottom: 8,
        alignItems: 'center',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Lexend_700Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'PublicSans_400Regular',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
        marginHorizontal: 50,
    },
});
