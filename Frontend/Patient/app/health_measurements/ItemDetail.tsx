import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';
import { ThemedView } from 'src/components';
import { ScalePressable } from 'src/components/ScalePressable';
import backend from 'src/services/Backend/backend.service';

export default function HealthMeasurementDetailScreen() {
    const { data } = useLocalSearchParams<{ data: string }>();
    const router = useRouter();
    const { theme } = useTheme();

    let measurement = null;
    try {
        measurement = JSON.parse(data);
    } catch (e) {
        console.error("Failed to parse measurement data", e);
    }

    if (!measurement) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.backgroundLight }]}>
                <Text style={{ color: theme.text }}>Measurement not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={{ color: theme.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleDelete = async () => {
        await backend.deleteHealthMeasurement(measurement.id);
        router.back();
    }

    const handleEdit = () => {
        router.push({
            pathname: '/health_measurements/EditMeasurement',
            params: { data }
        });
    }

    // Determine colors based on status
    let themeColor = measurement.unit.unit_name === 'Weight' ? theme.warning : measurement.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary;
    let lightThemeColor = measurement.unit.unit_name === 'Weight' ? theme.warningLight : measurement.unit.unit_name === 'Blood Sugar' ? theme.dangerLight : theme.primarySoft;
    let icon = measurement.unit.unit_name === 'Weight' ? 'weight' : measurement.unit.unit_name === 'Blood Sugar' ? 'tint' : 'heartbeat';

    switch (measurement.status) {
        case 'Requires Review':
        case 'Elevated':
            themeColor = theme.warning;
            lightThemeColor = theme.warningLight;
            break;
        case 'Normal':
        case 'Completed':
            themeColor = theme.success;
            lightThemeColor = theme.successLight;
            break;
        default:
            if (measurement.status === 'Requires Review' || measurement.status === 'High') {
                themeColor = theme.danger;
                lightThemeColor = theme.dangerLight;
            }
            break;
    }

    if (measurement.status === 'Requires Review') {
        themeColor = theme.danger;
        lightThemeColor = theme.dangerLight;
    }

    const dateObj = new Date(measurement.created_at);
    const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const displayValue = `${measurement.numeric_value} ${measurement.unit.symbol}`;

    return (
        <ThemedView safe style={[styles.container, { backgroundColor: theme.backgroundLight }]}>

            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.heroContent}>
                <View
                    style={[styles.iconBox, { backgroundColor: lightThemeColor }]}
                >
                    <FontAwesome5 name={icon} size={40} color={themeColor} />
                </View>

                <Text style={[styles.heroTitle, { color: theme.text }]}>
                    {measurement.unit.unit_name}
                </Text>

            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, { color: theme.textGray }]}>Measurement Value</Text>
                    <Text style={[styles.valueText, { color: theme.text }]}>{displayValue}</Text>
                </View>

                <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, { color: theme.textGray }]}>Category</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{measurement.special_condition}</Text>
                </View>

                <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, { color: theme.textGray }]}>Date Recorded</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{displayDate}</Text>
                </View>

                <View style={styles.detailCard}>
                    {measurement.ai_insight && <>
                        <Text style={[styles.detailLabel, { color: theme.textGray }]}>Doctor's Note / Insight</Text>
                        <Text style={[styles.detailDescription, { color: theme.text }]}>{measurement.ai_insight}</Text>
                    </>}
                </View>

                <ScalePressable
                    style= {[styles.editBtn, { backgroundColor: theme.primary }]}
                    onPress={handleEdit}
                >
                    <MaterialIcons name="edit" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.editBtnText}>Edit Entry</Text>
                </ScalePressable>

                <ScalePressable
                    onPress={handleDelete}
                    style= {[styles.deleteBtn, { backgroundColor: theme.backgroundLight, borderWidth: 1, borderColor: theme.danger }]}
                >
                    <MaterialIcons name="delete" size={20} color={theme.danger} style={{ marginRight: 8 }} />
                    <Text style={[styles.deleteBtnText, { color: theme.danger }]}>Delete Entry</Text>
                </ScalePressable>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        marginTop: 20,
        padding: 10,
    },
    heroHeader: {
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    closeButton: {
        padding: 4,
    },
    heroContent: {
        alignItems: 'center',
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '800',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 32,
    },
    detailCard: {
        marginBottom: 24,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    valueText: {
        fontSize: 32,
        fontWeight: '800',
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    detailDescription: {
        fontSize: 16,
        lineHeight: 24,
    },
    editBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        paddingVertical: 18,
        marginBottom: 16,
    },
    editBtnText: {
        fontSize: 16,
        fontFamily: 'Lexend_800ExtraBold',
        color: '#fff',
    },
    deleteBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        paddingVertical: 18,
        marginBottom: 16,
    },
    deleteBtnText: {
        fontSize: 16,
        fontFamily: 'Lexend_800ExtraBold',
        color: '#fff',
    },
});
