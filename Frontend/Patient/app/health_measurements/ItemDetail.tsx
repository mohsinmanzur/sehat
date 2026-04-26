import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';
import { ThemedView } from 'src/components';
import { ScalePressable } from 'src/components/ScalePressable';
import backend from 'src/services/Backend/backend.service';
import { GetHealthMeasurement } from '../../src/types/others';
import { GhostElement } from 'src/components/GhostElement';

export default function HealthMeasurementDetailScreen() {
    const { data, data2, primaryColor, secondaryColor } = useLocalSearchParams<{ data: string, data2?: string, primaryColor: string, secondaryColor: string }>();
    const router = useRouter();
    const { theme } = useTheme();

    const [secureUrl, setSecureUrl] = useState<string | null>(null);
    const [secureUrlLoading, setSecureUrlLoading] = useState(true);
    const [imageRatio, setImageRatio] = useState<number>(3 / 4);

    let measurement: GetHealthMeasurement | null = null;
    let secondaryMeasurement: GetHealthMeasurement | null = null;
    try {
        measurement = JSON.parse(data);
        if (data2) {
            secondaryMeasurement = JSON.parse(data2);
        }
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
        if (secondaryMeasurement) {
            await backend.deleteHealthMeasurement(secondaryMeasurement.id);
        }
        router.back();
    }

    const handleEdit = () => {
        router.push({
            pathname: '/health_measurements/EditMeasurement',
            params: { data: JSON.stringify(measurement), data2: secondaryMeasurement ? JSON.stringify(secondaryMeasurement) : undefined }
        });
    }

    useEffect(() => {
        async function loadSecureUrl() {
            setSecureUrlLoading(true);
            try {
                const res = await backend.getDocumentUrlfromMeasurementId(measurement.id);
                if (res && res.file_url) {
                    const response = await backend.getSecureDocumentUrl(res.file_url);
                    const url = response.file_url;
                    setSecureUrl(url);

                    if (url) {
                        Image.getSize(url, (width, height) => {
                            if (width && height) {
                                setImageRatio(width / height);
                            }
                        }, (error) => {
                            console.error('Failed to get image size:', error);
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load secure URL", error);
            }
            finally {
                setSecureUrlLoading(false);
            }
        }
        loadSecureUrl();
    }, [measurement.id]);

    // Determine colors based on status
    let themeColor = primaryColor || theme.primary;
    let lightThemeColor = secondaryColor || theme.primarySoft;
    let icon = measurement.measurement_unit.unit_name === 'Weight' ? 'weight' : measurement.measurement_unit.unit_name === 'Blood Sugar' ? 'tint' : 'heartbeat';

    const dateObj = new Date(measurement.created_at);
    const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const displayValue = `${measurement.numeric_value} ${measurement.measurement_unit.symbol}`;

    return (
        <ThemedView safe style={[styles.container, { backgroundColor: theme.backgroundDark }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginLeft: -5 }}>
                        <Ionicons name="arrow-back" size={22} color={theme.textGray} />
                    </TouchableOpacity>
                </View>

                <View style={styles.heroContent}>
                    <View
                        style={[styles.iconBox, { backgroundColor: lightThemeColor }]}
                    >
                        <FontAwesome5 name={icon} size={40} color={themeColor} />
                    </View>

                    <Text style={[styles.heroTitle, { color: theme.text }]}>
                        {measurement.measurement_unit.measurement_group}
                    </Text>

                </View>

                <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, { color: theme.textGray, marginTop: 10 }]}>Measurement Value</Text>
                    <Text style={[styles.valueText, { color: theme.text }]}>{secondaryMeasurement ? `${measurement.numeric_value}/${secondaryMeasurement.numeric_value} ${secondaryMeasurement.measurement_unit.symbol}` : displayValue}</Text>
                </View>

                <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, { color: theme.textGray }]}>Date Recorded</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{displayDate}</Text>
                </View>

                {secureUrlLoading && (
                    <View style={styles.imageContainer}>
                        <Text style={[styles.detailLabel, { color: theme.textGray, marginBottom: 8 }]}>Attached Document</Text>
                        <GhostElement style={[styles.attachedImage, { aspectRatio: imageRatio }]} />
                    </View>
                )}

                {secureUrl && !secureUrlLoading && (
                    <View style={styles.imageContainer}>
                        <Text style={[styles.detailLabel, { color: theme.textGray, marginBottom: 8 }]}>Attached Document</Text>
                        <Image
                            source={{ uri: secureUrl }}
                            style={[styles.attachedImage, { aspectRatio: imageRatio, backgroundColor: theme.backgroundLight }]}
                            resizeMode="contain"
                        />
                    </View>
                )}

                <ScalePressable
                    style={[styles.editBtn, { backgroundColor: theme.primary }]}
                    onPress={handleEdit}
                >
                    <MaterialIcons name="edit" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.editBtnText}>Edit Entry</Text>
                </ScalePressable>

                <ScalePressable
                    onPress={handleDelete}
                    style={[styles.deleteBtn, { backgroundColor: theme.backgroundLight, borderWidth: 1, borderColor: theme.danger }]}
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
        marginBottom: 20,
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
        paddingTop: 14,
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
    imageContainer: {
        marginBottom: 24,
        width: '100%',
    },
    attachedImage: {
        width: '100%',
        borderRadius: 16,
        marginTop: 8
    }
});
