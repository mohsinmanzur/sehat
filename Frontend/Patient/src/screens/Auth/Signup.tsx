import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@context/ThemeContext';
import { Spacer, ThemedButton, ThemedText, ThemedTextInput, ThemedView } from 'src/components';
import DatePicker from 'react-native-date-picker'
import { Dropdown } from 'react-native-element-dropdown';
import { bloodGroups } from '../../types/others';
import { Ionicons } from '@expo/vector-icons';
import SwitchToggle from 'react-native-switch-toggle';
import backend from '../../services/Backend/backend.service';
import Toast from 'react-native-toast-message';
import { useCurrentPatient } from '@context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;
const date = new Date();

const SignupScreen: React.FC<Props> = ({ route, navigation }) => {
    const { patientEmail } = route.params;
    const { theme } = useTheme();

    const { setCurrentPatient } = useCurrentPatient();

    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(date);
    const [bloodGroup, setBloodGroup] = useState('');
    const [betaOptIn, setBetaOptIn] = useState(false);

    const [showNameError, setShowNameError] = useState(false);
    const [showDobError, setShowDobError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handlePress = async () => {

        if (!name.trim())
        {
            if (dateOfBirth === date) setShowDobError(true);
            setShowNameError(true);
            return;
        }

        if (dateOfBirth === date)
        {
            setShowDobError(true);
            return;
        }

        setIsLoading(true);

        try
        {
            const patient = await backend.createPatient({
                name: name,
                email: patientEmail,
                date_of_birth: dateOfBirth,
                blood_group: bloodGroup || null,
                is_research_opt_in: betaOptIn
            });
            console.log(patient);
            setCurrentPatient(patient);

            navigation.replace('MainTabs');
        }
        catch (error)
        {
            console.log('Signup error:', error.message);
            Toast.show({
                type: 'error',
                text1: 'Failed to create account',
                text2: error.message,
                position: 'bottom',
                visibilityTime: 3000,
            });
        }
        finally
        {
            setIsLoading(false);
        }
    };

    return (
        <ThemedView style = {{ flex: 1, backgroundColor: theme.backgroundLight }} keyboardAvoid safe>
            <ScrollView 
                style = {{ flex: 1, width: '100%'  }}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Spacer height={40} />
                
                <ThemedText type={'title'}>Let's start your health{'\u00A0'}journey.</ThemedText>
                <ThemedText type={'subtitle'} style={[styles.tagline, { color: theme.textGray }]}>We'll keep your data private and clinical.</ThemedText>
            
                <Spacer height={20} />

                <ThemedText type={'h2'}>🙍 What should we call you?</ThemedText>
                <ThemedTextInput 
                    placeholder=" Enter your name"
                    value={name}
                    onChangeText={(text) => { setName(text); setShowNameError(false); }}
                    style={{ width: '100%', paddingVertical: 16, marginTop: 10, borderColor: showNameError ? theme.danger : theme.card, borderWidth: 1, borderRadius: 10 }}
                />

                <ThemedText type={'h2'} style={{ marginTop: 30 }}>🗓️ Date of Birth</ThemedText>
                <DatePicker
                    mode='date'
                    date={dateOfBirth}
                    onDateChange={(date) => { setDateOfBirth(date); setShowDobError(false); }}
                    maximumDate={new Date()}
                    locale={'en-GB'}
                    dividerColor={showDobError ? theme.danger : theme.text}
                />

                <ThemedText type={'h2'} style={{ marginTop: 20 }}>🩸 Blood Group</ThemedText>
                <Dropdown
                    data={bloodGroups}
                    value={bloodGroup}
                    onChange={(item) => setBloodGroup(item.value)}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Blood Group"
                    style={{ backgroundColor: theme.card, paddingVertical: 16, paddingHorizontal: 15, marginTop: 10, borderRadius: 10 }}
                    placeholderStyle={{ color: theme.textVeryLight, fontFamily: 'PublicSans_600SemiBold', fontSize: 15 }}
                    containerStyle={{ backgroundColor: theme.backgroundLight, paddingHorizontal: 5, borderRadius: 8, borderColor: theme.textVeryLight, height: 300 }}
                    selectedTextStyle={{ fontFamily: 'PublicSans_600SemiBold', fontSize: 15, color: theme.textGray }}
                    itemTextStyle={{ fontFamily: 'PublicSans_600SemiBold', fontSize: 15, color: theme.textGray }}
                    //itemContainerStyle={{ backgroundColor: theme.card, borderBottomWidth: 5, borderBottomColor: theme.backgroundLight }}
                    activeColor={theme.backgroundLight}
                />
                
                <Spacer height={50}/>

                <View style={{ backgroundColor: theme.card, padding: 30, borderRadius: 30 }}>
                    <View  style={{ flexDirection: 'row', gap: 10 }}>
                        <Ionicons name='flask-sharp' size={17} color={'#9A3200'} />
                        <ThemedText style={{ fontFamily: 'PublicSans_800ExtraBold', fontSize: 12, color: '#9A3200' }}>BETA PROGRAM</ThemedText>
                    </View>

                    <ThemedText type={'h2'} style={{ marginTop: 8 }}>Join Research </ThemedText>
                    <ThemedText style={{ color: theme.textLight, fontSize: 14, lineHeight: 20, marginTop: 8 }}>
                        Contribute your health scans to global medical research. Your identity stays 100% private.
                    </ThemedText>

                    <SwitchToggle
                        switchOn={betaOptIn}
                        onPress={() => setBetaOptIn(prev => !prev)}
                        circleColorOff={theme.backgroundLight}
                        circleColorOn={theme.primary}
                        backgroundColorOn={theme.primarySoft}
                        backgroundColorOff={theme.primarySoft}
                        duration={200}
                        containerStyle={{
                            width: 50,
                            height: 26,
                            borderRadius: 15,
                            padding: 4,
                            marginTop: 15,
                        }}
                        circleStyle={{
                            width: 19,
                            height: 19,
                            borderRadius: 10,
                        }}
                    />
                </View>

                <Spacer height={50} />

                <ThemedButton
                    style = {[styles.continueButton, { backgroundColor: isLoading ? theme.primaryDark : theme.primary, shadowColor: theme.primary }]}
                    onPress={handlePress}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color = {theme.backgroundLight} style = {{ padding: 9.5 }}/> 
                    ) : (
                        <>
                            <ThemedText style = {{ color: theme.backgroundLight, padding: 7, fontFamily: 'PublicSans_800ExtraBold', fontSize: 18 }}>Create my Health Profile</ThemedText>
                            <Ionicons name="arrow-forward" size={19} color={theme.backgroundLight} /> 
                        </>
                    )}
                </ThemedButton>

                <Text style = {{ textAlign: 'center', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <ThemedText type = {'default'} style = {{ color: theme.textGray, fontSize: 12 }}>
                        By joining, you agree to our{' '}
                    </ThemedText>
                    <ThemedText type = {'default'} style = {{ color: theme.primary, fontSize: 12 }}>
                        Terms{'\u00A0'}of{'\u00A0'}Service
                    </ThemedText>
                    <ThemedText type = {'default'} style = {{ color: theme.textGray, fontSize: 12 }}>
                        {' '}and{' '}
                    </ThemedText>
                    <ThemedText type = {'default'} style = {{ color: theme.primary, fontSize: 12 }}>
                        Privacy{'\u00A0'}Policy
                    </ThemedText>
                    .
                </Text>
            </ScrollView>
        </ThemedView>
    )
};

const styles = StyleSheet.create({
    tagline: {
        marginBottom: 20,
        fontSize: 18,
        paddingRight: 20,
        paddingTop: 10,
        fontFamily: 'PublicSans_600SemiBold'
    },
    continueButton: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        flexDirection: 'row',
        // iOS Shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Keeps the shadow soft
        shadowRadius: 6,
        
        // Android Shadow (shadowColor tint requires Android 9+)
        elevation: 6,
    },
});

export default SignupScreen;
