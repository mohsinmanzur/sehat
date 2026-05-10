import React from 'react';
import { useTheme } from 'src/context/ThemeContext';
import QRCodeStyled from 'react-native-qrcode-styled';
import { useCurrentPatient } from '@context/PatientContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const QRCodeCard: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient();

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.card, { backgroundColor: theme.backgroundLight, marginBottom: insets.bottom + 70 }]}>

            <Pressable onPress={onClose} hitSlop={16} style={styles.handleWrapper}>
                <View style={[styles.handle, { backgroundColor: theme.textVeryLight }]} />
            </Pressable>

            <Text style={[styles.title, { color: theme.text }]}>Your QR Code</Text>

            <Text style={[styles.subtitle, { color: theme.textLight }]}>
                Scan this code from someone's account to see their shared health reports.
            </Text>

            <View>
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
