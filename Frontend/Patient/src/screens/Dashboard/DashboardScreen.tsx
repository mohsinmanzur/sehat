import React from 'react';
import { StyleSheet } from 'react-native';
import { useCurrentPatient } from '@context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@context/ThemeContext';
import backend from 'src/services/Backend/backend.service';
import { ThemedText, ThemedView } from 'src/components';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const { currentPatient } = useCurrentPatient();
  const [healthMeasurements, setHealthMeasurements] = React.useState<any>(null);

  React.useEffect(() => {
    if (currentPatient?.id) {
      backend.getMeasurementsByPatient(currentPatient.id).then((measurements) => {
        setHealthMeasurements(measurements);
      }).catch(console.error);
    }
  }, [currentPatient?.id]);
  
  return (
    <ThemedView safe keyboardAvoid style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{ color: theme.text }}>{currentPatient?.name || 'No patient selected'}</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
});

export default DashboardScreen;
