import React from 'react';
import { StyleSheet } from 'react-native';
import { useCurrentPatient } from '@context/PatientContext';
import { useRouter } from 'expo-router';
import { useTheme } from 'src/context/ThemeContext';
import backend from 'src/services/Backend/backend.service';
import { ThemedButton, ThemedText, ThemedView } from 'src/components';

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const { currentPatient, setCurrentPatient } = useCurrentPatient();
  const [healthMeasurements, setHealthMeasurements] = React.useState<any>(null);

  React.useEffect(() => {
    if (currentPatient?.id) {
      backend.getMeasurementsByPatient(currentPatient.id).then((measurements) => {
        setHealthMeasurements(measurements);
      }).catch(console.error);
    }
  }, [currentPatient?.id]);

  const handleLogout = () => {
    backend.logout();
    setCurrentPatient(null);
    router.replace('/Login');
  };
  
  return (
    <ThemedView safe keyboardAvoid style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{ color: theme.text }}>{currentPatient?.name || 'No patient selected'}</ThemedText>

      <ThemedButton onPress={handleLogout}>
        <ThemedText style={{ color: theme.backgroundDark }}>Logout</ThemedText>
      </ThemedButton>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
});

export default DashboardScreen;
