import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@context/ThemeContext';
import { ThemedText, ThemedView } from 'src/components';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ route, navigation }) => {
    const { patientEmail } = route.params;

    const { theme } = useTheme();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePress = async (patientEmail: string) => {
    };

    return (
        <ThemedView style = {{ flex: 1 }} keyboardAvoid>
            <ScrollView 
                style = {{ flex: 1, width: '100%' }}
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
            </ScrollView>

            <ThemedText type={'title'}>Let's start your health journey.</ThemedText>

        </ThemedView>
    )
};

const styles = StyleSheet.create({

});

export default SignupScreen;
