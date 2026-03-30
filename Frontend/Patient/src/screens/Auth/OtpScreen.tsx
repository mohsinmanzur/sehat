import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useCurrentPatient } from '@context/UserContext';
import { useTheme } from '@context/ThemeContext';
import backend from 'src/services/Backend/backend.service';
import Toast from 'react-native-toast-message';
import { Spacer, ThemedButton, ThemedText, ThemedView } from 'src/components';
import { Ionicons } from '@expo/vector-icons';
import { OtpInput } from "react-native-otp-entry";

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const OtpScreen: React.FC<Props> = ({ route, navigation }) => {
    const { setCurrentPatient } = useCurrentPatient();
    const [isLoading, setIsLoading] = useState(false);

    const [otp, setOtp] = useState('')

    const { patientEmail } = route.params;
    const { theme } = useTheme();

    const handleVerify = async (otpCode?: string) => {

        try
        {
            setIsLoading(true);
            const verifyresponse = await backend.verifycode(patientEmail, otpCode || otp);

            if (verifyresponse.needsRegistration)
            {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Signup', params: { patientEmail } }],
                });
                setIsLoading(false);
                return;
            }

            const patient = await backend.getPatientByEmail(patientEmail);
            setCurrentPatient(patient);
            navigation.replace('MainTabs');

            setIsLoading(false);
        }
        catch (error)
        {
            Toast.show({
                type: 'error',
                text1: 'Verification failed',
                text2: error.message,
                position: 'bottom',
                visibilityTime: 3000,
            });
            setIsLoading(false);
            return;
        }
    };

    return (
        <ThemedView safe keyboardAvoid>
            <ScrollView 
                style = {{ flex: 1, width: '100%' }}
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Spacer height = {50} />
                <View style = {{ backgroundColor: theme.backgroundLight, borderRadius: 20, padding: 30, width: '90%', elevation: 5, shadowColor: theme.shadow }}>
                    <ThemedText type = {'h2'} style = {{ alignSelf: 'center', fontFamily: 'Lexend_700Bold' }}>
                        Verify Your Account
                    </ThemedText>
                    <ThemedText style = {{ color: theme.textLight, fontSize: 12, textAlign: 'center', padding: 7, lineHeight: 17 }}>
                        Enter the 6-digit code we sent to your phone/email.
                    </ThemedText>

                    <Spacer height = {20} />

                    <OtpInput
                        numberOfDigits={6}
                        type="numeric"
                        onTextChange={setOtp}
                        onFilled={(otpCode) => handleVerify(otpCode)}
                        disabled={isLoading}
                        focusStickBlinkingDuration={500}
                        autoFocus={false}
                        theme= {{
                            focusStickStyle: { backgroundColor: theme.primary, height: 24 },
                            pinCodeContainerStyle: { backgroundColor: theme.card, borderColor: theme.card, borderRadius: 14, height: 45, width: 40 },
                            focusedPinCodeContainerStyle: { borderColor: theme.card },
                            pinCodeTextStyle: { color: theme.primary, fontFamily: 'Lexend_800ExtraBold'}
                        }}
                    />

                    <ThemedButton
                        style = {[styles.verifyButton, { backgroundColor: isLoading ? theme.primaryDark : theme.primary, shadowColor: theme.primary }]}
                        onPress={() => handleVerify()}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color = {theme.backgroundLight} style = {{ padding: 6.5 }}/> 
                        ) : (
                            <>
                                <ThemedText style = {{ color: theme.backgroundLight, padding: 7, fontFamily: 'PublicSans_600SemiBold' }}>Verify Identity</ThemedText>
                                <Ionicons name="arrow-forward" size={19} color={theme.backgroundLight} /> 
                            </>
                        )}
                    </ThemedButton>

                    <Text style = {{ textAlign: 'center', fontSize: 13, marginTop: 10 }}>
                        <ThemedText style = {{ color: theme.textLight }}>Didn't receive a code? </ThemedText>
                        <ThemedText style = {{ color: theme.primary, fontFamily: 'PublicSans_700Bold' }}>Resend Code</ThemedText>
                    </Text>
                </View>
                <View style = {{ flexDirection: 'row', alignItems: 'center', marginTop: 15, gap: 10 }}>
                    <Ionicons name="lock-closed" size={17} color={theme.primary}/>
                    <ThemedText style = {{ fontSize: 12, fontFamily: 'PublicSans_700Bold', color: theme.textGray }}>End-to-End Encrypted Health Data</ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    verifyButton: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        marginTop: 30,
        flexDirection: 'row',
        // iOS Shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Keeps the shadow soft
        shadowRadius: 6,
        
        // Android Shadow (shadowColor tint requires Android 9+)
        elevation: 6,
    },
});

export default OtpScreen;
