import { useCurrentPatient } from "@context/PatientContext";
import { useTheme } from "@context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@theme/colors";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Snackbar } from "react-native-snackbar";
import { ThemedText, ThemedView } from "src/components";
import { ScalePressable } from "src/components/ScalePressable";
import backend from "src/services/Backend/backend.service";

const ProfileScreen: React.FC = () => {

    const { theme } = useTheme();
    const { setCurrentPatient } = useCurrentPatient();

    const styles = styleSheet(theme);

    const handleLogout = () => {
        setCurrentPatient(null);
        backend.logout();
        Snackbar.show({
            text: "Logged out successfully",
            duration: Snackbar.LENGTH_SHORT,
            backgroundColor: theme.primaryDark,
            textColor: '#FFFFFF'
        })
    };

    return (
        <ThemedView safe>
            <Pressable style={styles.backButton} onPress={router.back}>
                <Ionicons name="arrow-back" color={theme.textGray} size={20} />
            </Pressable>

            <ScalePressable style={styles.logoutButtton} onPress={handleLogout}>
                <ThemedText style={{ color: '#FFFFFF' }}>Logout</ThemedText>
            </ScalePressable>
        </ThemedView>
    );
};

export default ProfileScreen;

const styleSheet = (theme: typeof Colors.dark) => StyleSheet.create({
    backButton: {
        marginTop: 20,
        marginLeft: 20,
        height: 40,
        width: 40,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.card
    },
    logoutButtton: {
        alignSelf: "center",
        backgroundColor: theme.primaryDark,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20
    }
})