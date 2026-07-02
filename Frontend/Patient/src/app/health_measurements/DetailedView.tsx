import { useTheme } from '@context/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, RefreshControl } from 'react-native';
import { ThemedText, ThemedView } from 'src/components';
import { useCurrentPatient } from '@context/PatientContext';
import { getRelativeTimeRange } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';
import { HistoryRow } from 'src/components/detailed_view/history_row';
import { WeightChart } from 'src/components/detailed_view/weight_chart';
import { Header } from 'src/components/detailed_view/header';
import { GhostElement } from 'src/components/GhostElement';
import { ReferenceRange, HealthMeasurement } from '../../types/types';
import { findBestReferenceRange } from 'src/helpers/detailed_view.helpers';
import { useMeasurements } from '../../hooks/useMeasurements';
import { useReferenceRanges } from '../../hooks/useReferenceRanges';

export default function DetailedViewScreen() {
    const { data, primaryColor, secondaryColor } = useLocalSearchParams<{ data: string; primaryColor: string; secondaryColor: string }>();
    const { currentPatient } = useCurrentPatient();
    const { theme } = useTheme();

    const measurement = useMemo(() => {
        if (!data) return null;
        try {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                return parsedData[parsedData.length - 1] as HealthMeasurement;
            }
            return parsedData as HealthMeasurement;
        } catch {
            return null;
        }
    }, [data]);

    const { measurements: allPatientMeasurements, isLoading, isSyncing, refresh } = useMeasurements(currentPatient?.id);
    const { ranges: primaryRanges } = useReferenceRanges(measurement?.measurement_unit?.id);

    const [refreshing, setRefreshing] = useState(false);

    const { allMeasurements, diastolicMeasurements } = useMemo(() => {
        if (!measurement || allPatientMeasurements.length === 0) {
            return { allMeasurements: [], diastolicMeasurements: [] as (HealthMeasurement | null)[] };
        }

        let filtered = allPatientMeasurements.filter(m =>
            m.measurement_unit?.measurement_group?.toLowerCase() === measurement.measurement_unit?.measurement_group?.toLowerCase()
        );

        let alignedDiastolic: (HealthMeasurement | null)[] = [];

        if (measurement.measurement_unit?.measurement_group?.toLowerCase() === 'blood pressure') {
            const diastolicRaw = filtered.filter(m => m.measurement_unit?.unit_name?.toLowerCase() === 'diastolic');
            filtered = filtered.filter(m => m.measurement_unit?.unit_name?.toLowerCase() !== 'diastolic');
            alignedDiastolic = filtered.map(primary =>
                diastolicRaw.find(sec =>
                    new Date(sec.created_at!).getTime() === new Date(primary.created_at!).getTime()
                ) || null
            );
        } else {
            filtered = filtered.filter(m => m.measurement_unit?.unit_name === measurement.measurement_unit?.unit_name);
        }

        return { allMeasurements: filtered, diastolicMeasurements: alignedDiastolic };
    }, [allPatientMeasurements, measurement]);

    const bestReferenceRange: ReferenceRange | null = useMemo(
        () => measurement ? findBestReferenceRange(measurement, primaryRanges, currentPatient ?? undefined) : null,
        [measurement, primaryRanges, currentPatient]
    );

    const diastolicUnit = diastolicMeasurements[0] ?? null;
    const { ranges: diastolicRanges } = useReferenceRanges(diastolicUnit?.measurement_unit?.id);

    const diastolicReferenceRange: ReferenceRange | null = useMemo(
        () => diastolicUnit ? findBestReferenceRange(diastolicUnit, diastolicRanges, currentPatient ?? undefined) : null,
        [diastolicUnit, diastolicRanges, currentPatient]
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const stats = useMemo(() => {
        if (!allMeasurements || allMeasurements.length < 2) return null;
        const latest = allMeasurements[0];
        const oldest = allMeasurements[allMeasurements.length - 1];
        if (!latest || !oldest) return null;
        const diff = latest.numeric_value - oldest.numeric_value;
        const timeRange = getRelativeTimeRange(oldest.created_at, latest.created_at);
        return {
            diff: diff.toFixed(1),
            timeRange,
            isDown: diff < 0,
            isNeutral: diff === 0
        };
    }, [allMeasurements]);

    return (
        <ThemedView safe style={{ backgroundColor: theme.backgroundDark }}>
            <Header title={`${measurement?.measurement_unit?.measurement_group} History`} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isSyncing}
                        onRefresh={onRefresh}
                        tintColor={primaryColor || theme.primary}
                        colors={[primaryColor || theme.backgroundDark]}
                        progressBackgroundColor={theme.backgroundLight}
                    />
                }
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={[styles.currentLabel, { color: theme.textLight }]}>
                        CURRENT {measurement?.measurement_unit?.measurement_group?.toUpperCase()}
                    </Text>
                    {isLoading ? (
                        <GhostElement style={{ height: 68, width: 140, borderRadius: 8, marginBottom: 14 }} />
                    ) : (() => {
                        const primaryVal = allMeasurements[0]?.numeric_value;
                        const diastolicItem = diastolicMeasurements[0]?.numeric_value;
                        return (
                            <View style={styles.currentRow}>
                                <Text style={[styles.currentValue, { color: theme.text }]}>{primaryVal}</Text>
                                {diastolicItem !== undefined && diastolicItem !== null &&
                                    <Text style={[styles.currentValue, { color: theme.text, fontSize: 45 }]}>/{diastolicItem}</Text>
                                }
                                <Text style={[styles.currentUnit, { color: theme.text }]}>{measurement?.measurement_unit?.symbol}</Text>
                            </View>
                        );
                    })()}

                    {isLoading ? (
                        <GhostElement style={{ height: 38, width: 180, borderRadius: 24, marginBottom: 24 }} />
                    ) : (
                        stats && (
                            <View style={[styles.statsPill, { backgroundColor: theme.backgroundLight }]}>
                                <Text>
                                    <ThemedText style={{ fontFamily: 'PublicSans_700Bold' }}>Target: </ThemedText>
                                    {bestReferenceRange ? (
                                        <ThemedText>
                                            {bestReferenceRange.min_value}
                                            {diastolicReferenceRange && `/${diastolicReferenceRange.min_value}`}
                                            {' - '}
                                            {bestReferenceRange.max_value}
                                            {diastolicReferenceRange && `/${diastolicReferenceRange.max_value}`}
                                            {` ${measurement?.measurement_unit?.symbol}`}
                                        </ThemedText>
                                    ) : (
                                        <ThemedText> - </ThemedText>
                                    )}
                                </Text>
                            </View>
                        )
                    )}
                </Animated.View>

                <Animated.View
                    style={[styles.card, { backgroundColor: theme.backgroundLight, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                >
                    <View style={styles.cardHeader}>
                        {isLoading ? (
                            <GhostElement style={{ height: 20, width: 150, borderRadius: 4, marginBottom: 3 }} />
                        ) : stats ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text style={[styles.statsPillIcon, { color: primaryColor || theme.primary }]}>
                                    {stats.isNeutral ? '•' : (stats.isDown ? '↘' : '↗')}
                                </Text>
                                <Text style={[styles.statsPillMain, { color: theme.text }]}> {stats.diff} {measurement?.measurement_unit?.symbol}</Text>
                                <Text style={[styles.statsPillSub, { color: theme.textGray }]}>  over {stats.timeRange}</Text>
                            </View>
                        ) : null}
                    </View>
                    {isLoading ? (
                        <GhostElement style={{ height: 180, borderRadius: 12, marginTop: 10 }} />
                    ) : (
                        <WeightChart measurements={allMeasurements} secondaryMeasurements={diastolicMeasurements} color={primaryColor} />
                    )}
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
                    </View>
                    <View style={[styles.logCard, { backgroundColor: theme.backgroundLight }]}>
                        {isLoading ? (
                            <View style={{ padding: 16, gap: 16 }}>
                                {[1, 2, 3, 4].map(key => (
                                    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <GhostElement style={{ width: 44, height: 44, borderRadius: 22 }} />
                                        <View style={{ flex: 1, gap: 8 }}>
                                            <GhostElement style={{ width: '50%', height: 16, borderRadius: 4 }} />
                                            <GhostElement style={{ width: '30%', height: 12, borderRadius: 4 }} />
                                        </View>
                                        <GhostElement style={{ width: 30, height: 16, borderRadius: 4 }} />
                                    </View>
                                ))}
                            </View>
                        ) : (
                            allMeasurements.map((item: HealthMeasurement, idx) => {
                                const nextItem = allMeasurements[idx + 1];
                                const delta = nextItem ? item.numeric_value - nextItem.numeric_value : undefined;
                                const isLast = idx === allMeasurements.length - 1;
                                return (
                                    <ScalePressable
                                        key={item.id}
                                        onPress={() => router.push({
                                            pathname: `/health_measurements/ItemDetail`,
                                            params: { id: item.id, data: JSON.stringify(item), data2: JSON.stringify(diastolicMeasurements?.[idx]), primaryColor, secondaryColor }
                                        })}
                                    >
                                        <HistoryRow
                                            key={item.id}
                                            item={item}
                                            secondaryItem={diastolicMeasurements?.[idx]}
                                            isLast={isLast}
                                            delta={delta}
                                            measurements={allMeasurements}
                                            color={primaryColor}
                                        />
                                    </ScalePressable>
                                );
                            })
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 100, paddingTop: 8 },
    currentLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4, marginBottom: 6, marginTop: 4 },
    currentRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
    currentValue: { fontSize: 68, fontWeight: '900', lineHeight: 68, letterSpacing: -2 },
    currentUnit: { fontSize: 22, fontWeight: '600', marginBottom: 0, marginLeft: 4 },
    statsPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 9, marginBottom: 24, elevation: 1.5 },
    statsPillIcon: { fontSize: 14, fontWeight: '700' },
    statsPillMain: { fontSize: 14, fontWeight: '700' },
    statsPillSub: { fontSize: 13, fontWeight: '400' },
    card: { borderRadius: 20, padding: 20, paddingTop: 17, marginBottom: 28, elevation: 1.5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    cardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 3 },
    cardSub: { fontSize: 13, fontWeight: '400' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '800' },
    logCard: { borderRadius: 20, elevation: 1 },
});
