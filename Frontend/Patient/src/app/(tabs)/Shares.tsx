import { useTheme } from "@context/ThemeContext";
import React, { useState, useEffect } from "react";
import { Colors } from "../../constants/colors";
import { RefreshControl, StyleSheet, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { SvgXml } from "react-native-svg";
import { doctorSvg } from "../../constants/avatars";
import { router } from "expo-router";
import { Snackbar } from "react-native-snackbar";
import { useCurrentPatient } from "@context/PatientContext";
import { useShares } from "../../hooks/useShares";
import { useNetwork } from "../../context/NetworkContext";
import { useDeviceOnlySetting } from "../../hooks/useDeviceOnlySetting";
import { OfflineBanner } from "../../components/common/OfflineBanner";
import { DeviceOnlyBanner } from "../../components/common/DeviceOnlyBanner";
import { Spacer, ThemedText, ThemedView } from "../../components";
import { ScalePressable } from "../../components/ScalePressable";
import backend from "../../services/Backend/backend.service";

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
    const { currentPatient } = useCurrentPatient();
    const { isOnline } = useNetwork();
    const { isDeviceOnly } = useDeviceOnlySetting(currentPatient?.id);

    const styles = StylesFunc(theme);

    const { shares: currentAccessGrants, isLoading, isSyncing, refresh } = useShares(currentPatient?.id);

    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    const handleRevokeAccess = async (id: string) => {
        if (!isOnline) {
            Snackbar.show({
                text: 'Cannot revoke access while offline',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.danger,
            });
            return;
        }
        setRevokingId(id);
        try {
            await backend.revokeShare(currentPatient!.id!, id);
            await refresh();
            Snackbar.show({
                text: 'Access revoked successfully',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.primarySoft,
                textColor: theme.primary,
            });
        } catch (error: any) {
            Snackbar.show({
                text: `Failed to revoke access: ${error.message}`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.danger,
                textColor: theme.text,
            });
        } finally {
            setRevokingId(null);
        }
    };

    const activeGrants = currentAccessGrants.filter(
        (item) => item.expires_at && new Date(item.expires_at).getTime() - new Date().getTime() > 0
    );

    return (
        <>
            <OfflineBanner />
            <DeviceOnlyBanner isDeviceOnly={isDeviceOnly} />
            <ThemedView
                safe
                scroll
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isSyncing}
                        onRefresh={onRefresh}
                        colors={[theme.primary]}
                        tintColor={theme.primary}
                        progressBackgroundColor={theme.backgroundLight}
                    />
                }
            >
                <ThemedText type={'h1'} style={styles.title}>
                    Shared Health Records
                </ThemedText>

                <ThemedText style={{ color: theme.textGray, marginBottom: 24, marginTop: -5, fontSize: 14, lineHeight: 20 }}>
                    Here are all your shared health records.
                </ThemedText>

                {activeGrants.length === 0 && (
                    <View style={{ height: '160%', justifyContent: 'center', alignItems: 'center' }}>
                        <ThemedText style={{ fontSize: 15, color: theme.textGray, paddingHorizontal: 20, textAlign: 'center', marginTop: 20 }}>
                            No reports currently shared.
                        </ThemedText>
                    </View>
                )}

                {activeGrants.map((item) => (
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
                                <ThemedText type={'h3'} numberOfLines={1} ellipsizeMode="tail">
                                    {item.doctor ? item.doctor.name : 'Anyone With Access'}
                                </ThemedText>
                                {item.doctor && (item.doctor.specialization || item.doctor.associated_hospital) &&
                                    <ThemedText style={styles.doctorInfo} numberOfLines={1} ellipsizeMode="tail">
                                        {item.doctor.specialization && `${item.doctor.specialization} • `}{item.doctor.associated_hospital}
                                    </ThemedText>
                                }
                                <View style={styles.timeRow}>
                                    <FontAwesome5 name="hourglass-half" color={theme.primary} size={11} />
                                    {item.expires_at && new Date(item.expires_at).getFullYear() - new Date().getFullYear() > 50 ?
                                        <ThemedText style={styles.timeLeft}>Unlimited Access</ThemedText> :
                                        item.expires_at ? <CountdownTimer expiresAt={item.expires_at} style={styles.timeLeft} /> : null
                                    }
                                </View>
                            </View>
                        </View>
                    </ScalePressable>
                ))}

                <Spacer height={180} />
            </ThemedView>
        </>
    );
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
});
