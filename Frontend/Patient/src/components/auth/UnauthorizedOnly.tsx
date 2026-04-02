import { router } from "expo-router";
import { useEffect } from "react";
import LoadingScreen from "../LoadingScreen";
import { useCurrentPatient } from "@context/PatientContext";

export const UnauthorizedOnly = ({ children }: { children: React.ReactNode }) => {
    const { currentPatient, isInitialized } = useCurrentPatient();

    useEffect(() => {
        if (isInitialized && currentPatient) {
            router.replace("/(tabs)/Dashboard");
        }
    }, [currentPatient, isInitialized]);

    if (!isInitialized || currentPatient) {
        return <LoadingScreen />;
    }

    return children;
}