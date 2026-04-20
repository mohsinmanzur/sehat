import { useTheme } from "@context/ThemeContext";
import React, { useState, useEffect } from "react";
import { Colors } from "../../src/constants/colors";
import { access_grant_data } from "../../src/constants/sample-data";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Spacer, ThemedText, ThemedView } from "src/components";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { SvgXml } from "react-native-svg";
import { doctorSvg } from "../../src/constants/avatars";
import { ScalePressable } from "src/components/ScalePressable";
import { CustomTimePickerModal } from "src/components";
import { router } from "expo-router";
import { useGlobalContext } from "@context/GlobalContext";

export function CountdownTimer({ expiresAt, style }: { expiresAt: string | Date, style?: any }) {
    
    const calculateTimeLeft = () => {
        const difference = new Date(expiresAt).getTime() - new Date().getTime();
        if (difference <= 0) return 'Expired';
        const days = Math.floor((difference / (1000 * 60 * 60 * 24)));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        return `${days}D ${hours}H ${minutes}M`;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 10000);
        return () => clearInterval(timer);
    }, [expiresAt]);

    return <ThemedText style={style}>{timeLeft}</ThemedText>;
}

export default function Share()
{
    const { theme } = useTheme();
    const { selectedReports } = useGlobalContext();

    const styles = StylesFunc(theme);

    const [revokingId, setRevokingId] = useState<string | null>(null);

    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

    const [selectedTime, setSelectedTime] = useState({ days: 0, hours: 1, minutes: 0 });

    const handleRevokeAccess = (id: string) => {
        setRevokingId(id);
        setTimeout(() => {
            setRevokingId(null);
        }, 2000);
    }

    return (
        <ThemedView safe scroll style={styles.container} showsVerticalScrollIndicator={false}>
            <ThemedText type={'h1'} style={styles.title}>
                Share Health Records
            </ThemedText>

            <View style={styles.templateContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <ThemedText type={'h2'} style={{ marginRight: 10 }}>Select Reports</ThemedText>
                
                    {selectedReports.size > 0 && (
                        <View style={styles.selectedReportsCountContainer}>
                            <ThemedText style={styles.selectedReportsCount}>{selectedReports.size} Selected</ThemedText>
                        </View>
                    )}
                </View>

                <ScalePressable style={styles.selectReportsButton} onPress={() => router.navigate({ pathname: 'health_measurements/SelectReports' })}>
                    <FontAwesome5 name="file-medical" color={theme.textLight} size={21} style={{ marginRight: 7 }} />
                </ScalePressable>
            </View>

            <View style={[styles.templateContainer, { marginTop: 15 } ]}>
                <ThemedText type={'h2'} style={{ marginRight: 10 }}>
                    Access Time
                </ThemedText>
            
                <ScalePressable style={styles.selectReportsButton} onPress={() => setIsTimePickerVisible(true)}>
                    <ThemedText type={'h3'} style={{ color: theme.textGray }}>
                        {selectedTime.days !== 0 ? selectedTime.days + 'D' : ''} {selectedTime.hours !== 0 ? selectedTime.hours + 'H' : ''} {selectedTime.minutes !== 0 ? selectedTime.minutes + 'M' : ''}
                    </ThemedText>
                </ScalePressable>
            </View>

            <CustomTimePickerModal
                initialValue={selectedTime}
                onCancel={() => setIsTimePickerVisible(false)}
                onConfirm={(pickedDuration) => {
                    setSelectedTime(pickedDuration);
                    setIsTimePickerVisible(false);
                }}
                setIsVisible={setIsTimePickerVisible}
                visible={isTimePickerVisible}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ThemedText type={'h1'} style={styles.title}>
                    Current Access
                </ThemedText>
                {access_grant_data.length > 0 && <View style={{ padding: 5, backgroundColor: '#70D3B2', borderRadius: 50, marginTop: 17 }}/>}
            </View>

            {access_grant_data.filter((item) => new Date(item.expires_at).getTime() - new Date().getTime() > 0).map((item) => (
                <View key={item.id} style={styles.accessView}>
                    <View style={styles.accessDoctorInfoRow}>
                        <View style={styles.doctorIconContainer}>
                            <SvgXml xml={doctorSvg} />
                        </View>
                        <View>
                            <ThemedText type={'h3'}>{item.doctor.name}</ThemedText>
                            <ThemedText style={styles.doctorInfo}>
                                {item.doctor.specialization} • {item.doctor.associated_hospital}
                            </ThemedText>

                            <View style = {styles.timeRow}>
                                <FontAwesome5 name="hourglass-half" color={theme.primary} size={11} />
                                <CountdownTimer expiresAt={item.expires_at} style={styles.timeLeft} />
                            </View>
                        </View>
                    </View>

                    <ScalePressable
                        style={[styles.revokeButtonContainer, revokingId != null && { backgroundColor: '#a01717' }]}
                        onPress={() => handleRevokeAccess(item.id)}
                        disabled={revokingId != null}
                    >
                        {revokingId === item.id ? (
                            <ActivityIndicator color="#FFFFFF" style={{ paddingVertical: 2 }} />
                        ) : <>
                                <FontAwesomeIcon icon={faCircleXmark} color='#FFFFFF' size={18} style={{ marginTop: 1 }} />
                                <ThemedText type={'h3'} style={styles.revokeText}>
                                    Revoke Access
                                </ThemedText>
                            </>
                        }
                    </ScalePressable>
                </View>
            ))}

            <Spacer height={180} />

        </ThemedView>
    )
}

const StylesFunc = (theme: typeof Colors.dark) => StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 0
    },
    title: {
        paddingTop: 20,
        paddingBottom: 10,
    },
    accessView: {
        backgroundColor: theme.backgroundLight,
        marginBottom: 10,
        padding: 24,
        borderRadius: 30,
        elevation: 1
    },
    doctorIconContainer: {
        backgroundColor: '#73B8BA',
        borderRadius: 16,
        height: 55,
        width: 55,
        overflow: 'hidden',
    },
    doctorInfo: {
        fontSize: 12.5,
        color: theme.textLight,
        fontFamily: 'PublicSans_300Light',
        overflow: 'hidden',
    },
    accessDoctorInfoRow: {
        flexDirection: 'row',
        gap: 10
    },
    timeRow: {
        flexDirection: 'row',
        marginTop: 5,
        alignItems: 'center',
        gap: 7,
    },
    timeLeft: {
        fontSize: 11,
        color: theme.primary,
        fontFamily: 'Lexend_700Bold',
        marginTop: -2
    },
    revokeButtonContainer: {
        flexDirection: 'row',
        backgroundColor: '#BA1A1A',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginTop: 15,
        gap: 7
    },
    revokeText: {
        color: '#FFFFFF',
    },
    templateContainer: {
        backgroundColor: theme.backgroundLight,
        padding: 24,
        borderRadius: 30,
        elevation: 1
    },
    selectedReportsCountContainer: {
        backgroundColor: theme.primarySoft,
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 13
    },
    selectedReportsCount: {
        color: theme.primary,
        fontFamily: 'PublicSans_600SemiBold',
    },
    selectReportsButton: {
        backgroundColor: theme.card,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
    }
})