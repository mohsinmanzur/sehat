import { StyleSheet, View, Modal, TouchableWithoutFeedback, ActivityIndicator } from "react-native"
import { ThemedText } from "../ThemedText"
import { useTheme } from "@context/ThemeContext";
import { Colors } from "../../constants/colors";
import { useCurrentPatient } from "@context/PatientContext";
import { useEffect, useState } from "react";
import backend from "src/services/Backend/backend.service";

interface SelectMeasurementsProps {
    visible: boolean;
    onClose: () => void;
}

export const SelectMeasurementsComponent: React.FC<SelectMeasurementsProps> = ({ visible, onClose }) => {

    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient();

    const [isLoading, setIsLoading] = useState(true);

    const [measurements, setMeasurements] = useState([]);

    useEffect(() => {
        const getMeasurements = async () => {
            setIsLoading(true);
            const measurements = await backend.getMeasurementsByPatient(currentPatient!.id);
            setMeasurements(measurements);
            setIsLoading(false);
        }
        getMeasurements();
    }, []);

    const styles = StylesFunc(theme);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        {isLoading ?
                            <ActivityIndicator size={22} color={theme.primary} />
                        : 
                            <View style={styles.container}>
                                <ThemedText>Test</ThemedText>
                            </View>
                        }
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const StylesFunc = (theme: typeof Colors.dark) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
    },
    container: {
        width: '90%',
        height: '80%',
        backgroundColor: theme.backgroundLight,
        borderRadius: 30,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        alignSelf: 'center',
    }
})