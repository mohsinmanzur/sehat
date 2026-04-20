import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ThemedText, ThemedView } from "src/components";
import { Header } from "src/components/detailed_view/header";
import { useTheme } from 'src/context/ThemeContext';
import backend from 'src/services/Backend/backend.service';
import { useCurrentPatient } from '@context/PatientContext';
import { GetHealthMeasurement } from '../../src/types/others';
import { iconMap } from '../../src/constants/general';
import { formatFullDateTime } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalContext } from '@context/GlobalContext';

const SelectReportsScreen = () => {
    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient();
    const { selectedReports, setSelectedReports } = useGlobalContext();

    const [measurements, setMeasurements] = useState<GetHealthMeasurement[]>([]);
    const [units, setUnits] = useState<string[]>([]);

    const [activeFilter, setActiveFilter] = useState('All');

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getMeasurements = async () => {
            setIsLoading(true);
            const data = await backend.getMeasurementsByPatient(currentPatient!.id);
            setMeasurements(data || []);
            setUnits(['All', ...Array.from(new Set(data?.map(d => d.measurement_unit.unit_name) || []))]);
            setIsLoading(false);
        }
        getMeasurements();
    }, [currentPatient?.id])

    const toggleSelection = (id: string) => {
        const next = new Set(selectedReports);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedReports(next);
    };

    return (
        <ThemedView safe style={styles.container}>
            <Header title="Share Reports" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <ThemedText style={styles.title}>Select Data to Share</ThemedText>
                <ThemedText style={{ color: theme.textGray, marginBottom: 24, fontSize: 14, lineHeight: 20 }}>
                    Choose the specific health measurements you want to include in this report.
                </ThemedText>

                {/* Filters */}
                { !isLoading  &&
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                        {units.map(f => {
                            const isActive = activeFilter === f;
                            const filteredMeasurements = measurements.filter(item => f === 'All' || item.measurement_unit.unit_name === f);
                            const allFilteredelected = filteredMeasurements.length > 0 && filteredMeasurements.every(item => selectedReports.has(item.id));
                            
                            const handleFilterPress = () => {
                                if (isActive) {
                                    // if clicking the active filter, toggle selection for all items in this filter
                                    const next = new Set(selectedReports);
                                    if (allFilteredelected) {
                                        filteredMeasurements.forEach(item => next.delete(item.id));
                                    } else {
                                        filteredMeasurements.forEach(item => next.add(item.id));
                                    }
                                    setSelectedReports(next);
                                } else {
                                    setActiveFilter(f);
                                }
                            };

                            return (
                                <ScalePressable
                                    key={f}
                                    style={[styles.filterChip, { backgroundColor: isActive ? theme.primary : theme.backgroundLight }]}
                                    onPress={handleFilterPress}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        {isActive && (
                                            <MaterialIcons
                                                name={allFilteredelected ? "check-circle" : "check-circle-outline"} 
                                                size={16}
                                                color="#fff"
                                                style={{ marginBottom: -1 }}
                                        />
                                        )}
                                        <ThemedText style={{ color: isActive ? '#fff' : theme.text, fontWeight: '600' }}>{f}</ThemedText>
                                    </View>
                                </ScalePressable>
                            );
                        })}
                    </ScrollView>
                }


                {/* List Items */}
                { isLoading ? 
                    <ActivityIndicator animating={isLoading} color={theme.primary} />
                :
                    <View style={styles.listContainer}>
                        {measurements.filter(item => activeFilter === 'All' || item.measurement_unit.unit_name === activeFilter).map(item => {
                            const isSelected = selectedReports.has(item.id);
                            const unitIndex = units.indexOf(item.measurement_unit.unit_name);
                            const primaryColor = theme.items[unitIndex % theme.items.length]?.primary || theme.primary;
                            const secondaryColor = theme.items[unitIndex % theme.items.length]?.secondary || theme.primarySoft;
                            const iconName = iconMap[item.measurement_unit.unit_name] || 'activity';

                            return (
                                <ScalePressable 
                                    key={item.id}
                                    style={[styles.listItem, { backgroundColor: theme.backgroundLight }]}
                                    activeOpacity={0.7}
                                    onPress={() => toggleSelection(item.id)}
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
                                            {item.measurement_unit.unit_name} • {formatFullDateTime(item.created_at)}
                                        </ThemedText>
                                    </View>
                                    
                                    <Ionicons 
                                        name={isSelected ? "checkbox" : "square-outline"} 
                                        size={24} 
                                        color={isSelected ? theme.primary : theme.textGray} 
                                    />
                                </ScalePressable>
                            );
                        })}
                    </View>
                }
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { backgroundColor: theme.backgroundDark }]}>
                <View>
                    <ThemedText style={styles.selectedCount}>{selectedReports.size} items</ThemedText>
                    <ThemedText style={styles.selectedCountSub}>selected</ThemedText>
                </View>
                <TouchableOpacity style={[styles.proceedBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8}>
                    <ThemedText style={styles.proceedBtnText}>Proceed to Share </ThemedText>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
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
    selectAllCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    selectAllText: {
        fontSize: 16,
        fontWeight: '700',
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    selectPageRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    selectedCount: {
        fontSize: 16,
        fontWeight: '800',
    },
    selectedCountSub: {
        fontSize: 14,
        color: '#6b7280',
    },
    proceedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
    },
    proceedBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default SelectReportsScreen;