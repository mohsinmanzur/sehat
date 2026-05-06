import { useTheme } from "@context/ThemeContext";
import React, { useState, useEffect } from "react";
import { Colors } from "../../src/constants/colors";
import { ActivityIndicator, RefreshControl, StyleSheet, View } from "react-native";
import { Spacer, ThemedText, ThemedTextInput, ThemedView } from "src/components";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { SvgXml } from "react-native-svg";
import { doctorSvg } from "../../src/constants/avatars";
import { ScalePressable } from "src/components/ScalePressable";
import { CustomTimePickerModal } from "src/components";
import { router, useFocusEffect } from "expo-router";
import { useGlobalContext } from "@context/GlobalContext";
import { Snackbar } from "react-native-snackbar";
import backend from "src/services/Backend/backend.service";
import { useCurrentPatient } from "@context/PatientContext";
import { AccessGrant } from "../../src/types/types";

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

export default function Share() {
    const { theme } = useTheme();
    const { selectedReports, setSelectedReports } = useGlobalContext();
    const { currentPatient } = useCurrentPatient();

    const styles = StylesFunc(theme);


    const [currentAccessGrants, setCurrentAccessGrants] = useState<AccessGrant[]>([]);

    const [revokingId, setRevokingId] = useState<string | null>(null);

    const [refreshing, setRefreshing] = useState(false);

    const loadShares = async () => {
        await backend.getPatientShares(currentPatient.id).then((data) => {
            setCurrentAccessGrants(data);
        });
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadShares().finally(() => setRefreshing(false));
    }, [currentPatient.id]);

    useFocusEffect(
        React.useCallback(() => {
            loadShares();
        }, [currentPatient.id])
    );

    const handleRevokeAccess = async (id: string) => {
        setRevokingId(id);

        try {
            await backend.revokeShare(currentPatient.id, id);
            loadShares();
            Snackbar.show({ text: 'Access revoked successfully', duration: Snackbar.LENGTH_SHORT, backgroundColor: theme.primarySoft, textColor: theme.primary });
        } catch (error: any) {
            Snackbar.show({ text: `Failed to revoke access: ${error.message}`, duration: Snackbar.LENGTH_SHORT, backgroundColor: theme.danger, textColor: theme.text });
        } finally {
            setRevokingId(null);
        }
    }

    return (
        <ThemedView
            safe
            scroll
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} progressBackgroundColor={theme.backgroundLight} />}
        >
            <ThemedText type={'h1'} style={styles.title}>
                Shared Health Records
            </ThemedText>

            <ThemedText style={{ color: theme.textGray, marginBottom: 24, marginTop: -5, fontSize: 14, lineHeight: 20 }}>
                Here are all your shared health records.
            </ThemedText>

            {currentAccessGrants.filter((item) => new Date(item.expires_at).getTime() - new Date().getTime() > 0).length === 0 && (
                <View style={{ height: '160%', justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText style={{ fontSize: 15, color: theme.textGray, paddingHorizontal: 20, textAlign: 'center', marginTop: 20 }}>
                        No reports currently shared.
                    </ThemedText>
                </View>
            )}

            {currentAccessGrants.filter((item) => new Date(item.expires_at).getTime() - new Date().getTime() > 0).map((item) => (
                <ScalePressable
                    key={item.id}
                    style={styles.accessView}
                    onPress={() => router.navigate({ pathname: 'share/SharedDetail', params: { data: JSON.stringify(item) } })}
                >
                    <View style={styles.accessDoctorInfoRow}>
                        <View style={[styles.doctorIconContainer, !item.doctor && { backgroundColor: theme.card }]}>
                            {item.doctor ? (
                                <SvgXml xml={doctorSvg} />
                            ) : (
                                <FontAwesome5 name="globe" color={theme.primary} size={27} />
                            )}
                        </View>
                        <View style={{ flex: 1, paddingRight: 20 }}>
                            <ThemedText type={'h3'} numberOfLines={1} ellipsizeMode="tail">{item.doctor ? item.doctor.name : 'Anyone With Access'}</ThemedText>
                            {item.doctor && item.doctor?.specialization || item.doctor?.associated_hospital &&
                                <ThemedText style={styles.doctorInfo} numberOfLines={1} ellipsizeMode="tail">
                                    {item.doctor.specialization && `${item.doctor.specialization} • `}{item.doctor.associated_hospital}
                                </ThemedText>
                            }

                            <View style={styles.timeRow}>
                                <FontAwesome5 name="hourglass-half" color={theme.primary} size={11} />
                                {
                                    new Date(item.expires_at).getFullYear() - new Date().getFullYear() > 50 ?
                                        <ThemedText style={styles.timeLeft}>Unlimited Access</ThemedText> :
                                        <CountdownTimer expiresAt={item.expires_at} style={styles.timeLeft} />
                                }
                            </View>
                        </View>
                    </View>

                    {/*

                    <ScalePressable
                        style={[styles.revokeButtonContainer, revokingId != null && { backgroundColor: '#a01717' }]}
                        onPress={() => handleRevokeAccess(item.id)}
                        disabled={revokingId != null}
                    >
                        {revokingId === item.id ? (
                            <ActivityIndicator color="#FFFFFF" style={{ paddingVertical: 2 }} />
                        ) : <>
                            <FontAwesomeIcon icon={faCircleXmark} color='#FFFFFF' size={18} style={{ marginTop: 1 }} />
                            <ThemedText type={'h3'} style={{ color: '#FFFFFF' }}>
                                Revoke Access
                            </ThemedText>
                        </>
                        }
                    </ScalePressable>
                    */}
                </ScalePressable>
            ))}

            <Spacer height={180} />

        </ThemedView >
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    doctorInfo: {
        fontSize: 12.5,
        color: theme.textLight,
        fontFamily: 'PublicSans_300Light',
        overflow: 'hidden',
    },
    accessDoctorInfoRow: {
        flexDirection: 'row',
        gap: 15
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
})