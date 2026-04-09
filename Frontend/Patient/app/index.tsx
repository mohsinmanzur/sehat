import { Redirect } from 'expo-router';
import { useCurrentPatient } from '../src/context/PatientContext';
import LoadingScreen from 'src/components/LoadingScreen';

export default function Index() {
  const { currentPatient, isInitialized } = useCurrentPatient();

  if (!isInitialized) {
    return (
      <LoadingScreen />
    );
  }

  if (currentPatient) {
    return <Redirect href="/(tabs)/Dashboard" />;
  }

  return <Redirect href="/(auth)/Login" />;
}