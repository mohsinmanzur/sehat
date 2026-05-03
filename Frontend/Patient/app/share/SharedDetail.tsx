import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemedText, ThemedView } from "src/components";
import { Header } from "src/components/detailed_view/header";
import { useTheme } from 'src/context/ThemeContext';
import backend from 'src/services/Backend/backend.service';
import { useCurrentPatient } from '@context/PatientContext';
import { HealthMeasurement } from '../../src/types/types';
import { iconMap } from '../../src/constants/general';
import { formatFullDateTime } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';
import { router } from 'expo-router';
import { GhostElement } from 'src/components/GhostElement';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { Snackbar } from 'react-native-snackbar';

const SharedDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { currentPatient } = useCurrentPatient();
    const { theme } = useTheme();

    const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
    const [units, setUnits] = useState<string[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [isRevokeLoading, setIsRevokeLoading] = useState(false);

    const handleRevokeAccess = async () => {
        setIsRevokeLoading(true);

        try {
            await backend.revokeShare(currentPatient.id, id);
            router.back();
            Snackbar.show({ text: 'Access revoked successfully', duration: Snackbar.LENGTH_SHORT, backgroundColor: theme.primarySoft, textColor: theme.primary });
        } catch (error: any) {
            Snackbar.show({ text: `Failed to revoke access: ${error.message}`, duration: Snackbar.LENGTH_SHORT, backgroundColor: theme.danger, textColor: theme.text });
        } finally {
            setIsRevokeLoading(false);
        }
    }

    React.useMemo(() => {

        const getMeasurements = async () => {
            const temp = await backend.getMeasurementsForShare(id);
            setMeasurements(temp);

            const unitSet = new Set<string>(['All']);
            temp.forEach(measurement => {
                const group = measurement.measurement_unit.measurement_group;

                if (group !== 'Blood Pressure') {
                    unitSet.add(group);
                }
                else {
                    unitSet.add("Blood Pressure");
                }
            });

            setUnits(Array.from(unitSet));
        }

        try {
            if (id) getMeasurements();
        }
        catch (e) {
            console.error("Failed to parse sharedMeasurementIds", e);
        }
        finally {
            setIsLoading(false);
        }
    }, [id]);

    return (
        <ThemedView safe style={styles.container}>
            <Header title="Shared Reports" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <ThemedText style={styles.title}>Health Records</ThemedText>
                <ThemedText style={{ color: theme.textGray, marginBottom: 24, fontSize: 14, lineHeight: 20 }}>
                    These are the records you've shared.
                </ThemedText>

                {/* Filters */}
                {isLoading ?
                    <View style={[styles.filterScroll, { flexDirection: 'row', gap: 10, paddingRight: 20 }]}>
                        <GhostElement style={{ width: 60, height: 32, borderRadius: 20 }} />
                        <GhostElement style={{ width: 120, height: 32, borderRadius: 20 }} />
                        <GhostElement style={{ width: 100, height: 32, borderRadius: 20 }} />
                    </View>
                    :
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                        {units.map(f => {
                            const isActive = activeFilter === f;
                            return (
                                <ScalePressable
                                    key={f}
                                    style={[styles.filterChip, { backgroundColor: isActive ? theme.primary : theme.backgroundLight }]}
                                    onPress={() => setActiveFilter(f)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <ThemedText style={{ color: isActive ? '#fff' : theme.text, fontWeight: '600' }}>{f}</ThemedText>
                                    </View>
                                </ScalePressable>
                            );
                        })}
                    </ScrollView>
                }


                {/* List Items */}
                {isLoading ?
                    <View style={styles.listContainer}>
                        {[1, 2, 3, 4, 5].map(key => (
                            <View key={key} style={[styles.listItem, { backgroundColor: theme.backgroundLight }]}>
                                <GhostElement style={[styles.iconContainer, { backgroundColor: theme.backgroundDark }]} />

                                <View style={styles.itemContent}>
                                    <View style={styles.valRow}>
                                        <GhostElement style={{ width: '40%', height: 20, borderRadius: 4, marginBottom: 4 }} />
                                    </View>
                                    <GhostElement style={{ width: '70%', height: 14, borderRadius: 4 }} />
                                </View>
                            </View>
                        ))}
                    </View>
                    :
                    <View style={styles.listContainer}>
                        {measurements.filter(item => {
                            const matchesFilter = activeFilter === 'All' || item.measurement_unit.measurement_group === activeFilter;
                            if (!matchesFilter) return false;
                            if (item.measurement_unit.measurement_group.toLowerCase() === 'blood pressure') {
                                return item.measurement_unit.unit_name.toLowerCase() === 'systolic';
                            }
                            return true;
                        }).map(item => {
                            const unitIndex = units.indexOf(item.measurement_unit.measurement_group) - 1; // subtract 1 to account for 'All' at index 0, aligning with Dashboard
                            const primaryColor = theme.items[unitIndex % theme.items.length]?.primary || theme.primary;
                            const secondaryColor = theme.items[unitIndex % theme.items.length]?.secondary || theme.primarySoft;
                            const iconName = iconMap[item.measurement_unit.measurement_group] || 'activity';

                            return (
                                <ScalePressable
                                    key={item.id}
                                    style={[styles.listItem, { backgroundColor: theme.backgroundLight }]}
                                    activeOpacity={0.7}
                                    onPress={() => { router.push({ pathname: `/health_measurements/ItemDetail`, params: { id: item.id, data: JSON.stringify(item), primaryColor, secondaryColor } }) }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: secondaryColor }]}>
                                        <FontAwesome5 name={iconName} size={22} color={primaryColor} />
                                    </View>

                                    <View style={styles.itemContent}>
                                        <View style={styles.valRow}>
                                            <ThemedText style={styles.itemValue}>{item.numeric_value}</ThemedText>
                                            <ThemedText style={styles.itemUnit}> {item.measurement_unit.symbol}</ThemedText>
                                        </View>
                                        <ThemedText style={styles.itemSubtext}>
                                            {item.measurement_unit.measurement_group} • {formatFullDateTime(item.created_at)}
                                        </ThemedText>
                                    </View>
                                </ScalePressable>
                            );
                        })}
                    </View>
                }
            </ScrollView>
            <ScalePressable
                style={[styles.revokeButtonContainer, isRevokeLoading && { backgroundColor: '#a01717' }]}
                onPress={handleRevokeAccess}
                disabled={isRevokeLoading}
            >
                {isRevokeLoading ? (
                    <ActivityIndicator color="#FFFFFF" style={{ paddingVertical: 2 }} />
                ) : <>
                    <FontAwesomeIcon icon={faCircleXmark} color='#FFFFFF' size={18} style={{ marginTop: 1 }} />
                    <ThemedText type={'h3'} style={{ color: '#FFFFFF' }}>
                        Revoke Access
                    </ThemedText>
                </>
                }
            </ScalePressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 110,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
    },
    filterScroll: {
        marginBottom: 20,
        flexGrow: 0,
    },
    filterContent: {
        gap: 10,
        paddingRight: 20,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    listContainer: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemContent: {
        flex: 1,
        justifyContent: 'center',
    },
    valRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    itemValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    itemUnit: {
        fontSize: 12,
        color: '#6b7280',
    },
    itemSubtext: {
        fontSize: 13,
        color: '#6b7280',
    },
    revokeButtonContainer: {
        flexDirection: 'row',
        backgroundColor: '#BA1A1A',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginTop: 15,
        gap: 7,
        position: 'absolute',
        bottom: 50,
        left: 30,
        right: 30,
        elevation: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
});

export default SharedDetailScreen;