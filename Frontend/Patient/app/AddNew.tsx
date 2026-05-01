import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Pressable, Animated, BackHandler, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from 'src/components';
import DatePicker from 'react-native-date-picker';
import { Dropdown } from 'src/components/common/Dropdown';
import backend from 'src/services/Backend/backend.service';
import LoadingScreen from 'src/components/LoadingScreen';
import { useCurrentPatient } from '@context/PatientContext';
import { formatOrdinalDate, formatTime } from 'src/utils/date';
import { errorShakeAnimation } from 'src/animations/animations';
import { ScalePressable } from 'src/components/ScalePressable';
import { useGlobalContext } from 'src/context/GlobalContext';
import { Snackbar } from 'react-native-snackbar';
import { MeasurementUnit } from '../src/types/dtos';

export default function AddNewMeasurement() {
    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient()
    const { scannedImage, setScannedImage } = useGlobalContext();
    const router = useRouter();

    const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit | null>(null);
    const [value, setValue] = useState('');
    const [value2, setValue2] = useState('');
    const value2Ref = useRef<TextInput>(null);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [showSelectedUnitError, setShowSelectedUnitError] = useState(false);
    const [showValueError, setShowValueError] = useState(false);

    const [isLoading, setisLoading] = useState(true);
    const [isSaving, setisSaving] = useState(false);

    const [pickerOpen, setPickerOpen] = useState<'date' | 'time' | null>(null);
    const [units, setUnits] = useState<MeasurementUnit[]>([]);

    const valueShakeAnimation = useRef(new Animated.Value(0)).current;
    const dropdownShakeAnimation = useRef(new Animated.Value(0)).current;

    const [specialConditions, setSpecialConditions] = useState<string[]>([]);
    const [selectedSpecialConditions, setSelectedSpecialConditions] = useState<string[]>([]);

    useEffect(() => {
        backend.getMeasurementUnits().then((units) => {
            setUnits(units);
            setisLoading(false);
        });
    }, []);

    const handleBack = () => {
        router.back();
        setScannedImage(null);
        return true;
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBack
        );
        return () => backHandler.remove();
    }, [router]);

    const handleSave = async () => {
        if (!selectedUnit) {
            if (!value) {
                setShowValueError(true);
                errorShakeAnimation(valueShakeAnimation);
            }
            setShowSelectedUnitError(true);
            errorShakeAnimation(dropdownShakeAnimation);
            return;
        }
        if (!value) {
            setShowValueError(true);
            errorShakeAnimation(valueShakeAnimation);
            return;
        }
        if (selectedUnit?.measurement_group === 'Blood Pressure' && !value2) {
            setShowValueError(true);
            errorShakeAnimation(valueShakeAnimation);
            return;
        }
        setShowSelectedUnitError(false);
        setShowValueError(false);

        setisSaving(true);

        try {
            let uploadresponse = null;
            if (scannedImage) {
                uploadresponse = await backend.createandUploadMedicalDocument({
                    patient_id: currentPatient?.id || '',
                    record_type: 'other',
                    file: scannedImage,
                });
            }

            await backend.createHealthMeasurement({
                patient_id: currentPatient?.id,
                document_id: uploadresponse?.id || null,
                unit_id: selectedUnit?.id,
                numeric_value: parseFloat(value),
                created_at: selectedDate,
            })

            if (selectedUnit?.measurement_group === 'Blood Pressure') {
                await backend.createHealthMeasurement({
                    patient_id: currentPatient?.id,
                    document_id: uploadresponse?.id || null,
                    unit_id: units.find((unit) => unit.unit_name === 'Diastolic' && unit.measurement_group === 'Blood Pressure')?.id,
                    numeric_value: parseFloat(value2),
                    created_at: selectedDate,
                })
            }

            router.back();
            Snackbar.show({
                text: 'Measurement added successfully',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.primary,
            })
            setScannedImage(null);
        }
        catch (error) {
            Snackbar.show({
                text: `Failed to add measurement: ${error.message}`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.danger,
            });
            throw new Error(error);
        }
        finally {
            setisSaving(false);
        }
    };

    const handleAddPhoto = () => {
        router.push('health_measurements/Scan');
    }

    const displayDate = formatOrdinalDate(selectedDate);
    const displayTime = formatTime(selectedDate);

    const s = styles(theme);

    return (isLoading ? <LoadingScreen /> :
        <ThemedView safe style={s.root}>
            {/* ── Custom Header ── */}
            <View style={s.header}>
                <TouchableOpacity onPress={handleBack} style={s.headerIcon}>
                    <Ionicons name="arrow-down" size={22} color={theme.textGray} />
                </TouchableOpacity>
                <ThemedText style={s.headerTitle}>Add Measurement</ThemedText>
                <Pressable style={[s.headerIcon, { opacity: 0 }]}>
                    <Ionicons name="ellipsis-vertical" size={20} color={theme.textGray} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Measurement Type ── */}
                <Dropdown
                    label="MEASUREMENT TYPE"
                    options={[...new Set(units.map((unit) => unit.measurement_group))]}
                    value={selectedUnit?.measurement_group}
                    onChange={(value) => { setSelectedUnit(units.find((unit) => unit.measurement_group === value) || null); setShowSelectedUnitError(false); }}
                    error={showSelectedUnitError}
                    remainingStyles={{ transform: [{ translateX: dropdownShakeAnimation }] }}
                />

                {/* ── Value & Unit ── */}
                <View style={s.row}>
                    <View style={s.col2}>
                        <Text style={s.label}>VALUE</Text>
                        <Animated.View style={[s.valueBox, { borderColor: showValueError ? theme.danger : theme.card, transform: [{ translateX: valueShakeAnimation }] }]}>
                            <TextInput
                                style={s.valueInput}
                                value={value}
                                onChangeText={(text) => {
                                    setValue(text);
                                    setShowValueError(false);
                                    if (text.length === 3 && selectedUnit?.measurement_group === 'Blood Pressure') {
                                        value2Ref.current?.focus();
                                    }
                                }}
                                keyboardType="phone-pad"
                                returnKeyType={selectedUnit?.measurement_group === 'Blood Pressure' ? "next" : "done"}
                                onSubmitEditing={() => {
                                    if (selectedUnit?.measurement_group === 'Blood Pressure') {
                                        value2Ref.current?.focus();
                                    }
                                }}
                                placeholderTextColor={theme.textVeryLight}
                                placeholder={selectedUnit?.measurement_group === 'Blood Pressure' ? '120' : '0'}
                                maxLength={3}
                                cursorColor={theme.primary}
                            />
                        </Animated.View>
                    </View>

                    {selectedUnit?.measurement_group === 'Blood Pressure' &&
                        <>
                            <ThemedText style={{ color: theme.textGray, fontSize: 50, marginBottom: 15 }}>/</ThemedText>

                            <View style={{ flex: 0.75 }}>
                                <Animated.View style={[s.valueBox, { borderColor: showValueError ? theme.danger : theme.card, transform: [{ translateX: valueShakeAnimation }] }]}>
                                    <TextInput
                                        ref={value2Ref}
                                        style={s.valueInput}
                                        value={value2}
                                        onChangeText={(text) => { setValue2(text); setShowValueError(false); }}
                                        keyboardType="phone-pad"
                                        placeholderTextColor={theme.textVeryLight}
                                        placeholder='80'
                                        maxLength={3}
                                        cursorColor={theme.primary}
                                    />
                                </Animated.View>
                            </View>
                        </>
                    }

                    <ThemedText style={s.unitText} type={'subtitle'}>{selectedUnit?.symbol}</ThemedText>
                </View>

                <View style={s.optionsRow}>
                    <ScalePressable
                        style={[s.optionPill, selectedSpecialConditions.includes('Fasting') && s.optionPillActive]}
                        onPress={() => {
                            if (selectedSpecialConditions.includes('Fasting')) {
                                setSelectedSpecialConditions(selectedSpecialConditions.filter((condition) => condition !== 'Fasting'));
                            } else {
                                setSelectedSpecialConditions([...selectedSpecialConditions, 'Fasting']);
                            }
                        }}
                    >
                        <Text style={[s.optionPillText, selectedSpecialConditions.includes('Fasting') && s.optionPillTextActive]}>Fasting</Text>
                    </ScalePressable>
                </View>

                {/* ── Date & Time ── */}
                <View style={s.row}>
                    <View style={s.col2}>
                        <Text style={s.label}>DATE</Text>
                        <TouchableOpacity
                            style={s.pickerBox}
                            onPress={() => setPickerOpen('date')}
                            activeOpacity={0.75}
                        >
                            <Text style={s.pickerText}>{displayDate}</Text>
                            <Ionicons name="calendar-outline" size={18} color={theme.textGray} />
                        </TouchableOpacity>
                    </View>
                    <View style={s.col2}>
                        <Text style={s.label}>TIME</Text>
                        <TouchableOpacity
                            style={s.pickerBox}
                            onPress={() => setPickerOpen('time')}
                            activeOpacity={0.75}
                        >
                            <Text style={s.pickerText}>{displayTime}</Text>
                            <Ionicons name="time-outline" size={18} color={theme.textGray} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── DatePicker Modal ── */}
                <DatePicker
                    modal
                    open={pickerOpen !== null}
                    date={selectedDate}
                    mode={pickerOpen ?? 'date'}
                    onConfirm={(picked) => {
                        setSelectedDate(picked);
                        setPickerOpen(null);
                    }}
                    onCancel={() => setPickerOpen(null)}
                />

                {/* ── Save Button ── */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 10 }}>
                    <View style={{ flex: 1 }}>
                        <ScalePressable
                            style={[s.saveBtn, { backgroundColor: theme.primary, width: '100%' }]}
                            onPress={handleSave}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={s.saveBtnText}>Save Measurement</Text>
                                    <MaterialIcons name="save" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </ScalePressable>
                    </View>

                    <Pressable
                        style={({ pressed }) => [s.iconBox, { backgroundColor: theme.primarySoft, marginRight: 0, marginTop: 8, opacity: pressed ? 0.8 : 1 }]}
                        collapsable={false}
                        onPress={handleAddPhoto}
                    >
                        <MaterialIcons
                            name={scannedImage ? "check" : "add-a-photo"}
                            size={23}
                            color={theme.primary}
                        />
                    </Pressable>
                </View>

                <Text style={[s.hipaaText, { color: theme.textLight }]}>
                    Data is encrypted and stored securely following HIPAA compliance guidelines.
                </Text>
            </ScrollView>
        </ThemedView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    root: {
        backgroundColor: theme.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 14,
        backgroundColor: theme.backgroundLight,
    },
    headerIcon: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: theme.text,
        fontSize: 17,
        fontFamily: 'Lexend_700Bold',
    },
    scroll: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    /* ── Labels ── */
    label: {
        fontSize: 11,
        fontFamily: 'Lexend_700Bold',
        color: theme.textLight,
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: 18,
    },
    iconBox: {
        width: 65,
        height: 65,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    /* ── Dropdown ── */
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.card,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownText: {
        fontSize: 15,
        fontFamily: 'Lexend_600SemiBold',
        color: theme.text,
    },
    dropdownList: {
        backgroundColor: theme.card,
        borderRadius: 14,
        marginTop: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.primarySoft,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.backgroundDark,
    },
    dropdownItemActive: {
        backgroundColor: theme.primarySoft,
    },
    dropdownItemText: {
        fontSize: 14,
        fontFamily: 'Lexend_600SemiBold',
        color: theme.text,
    },

    /* ── Row layout ── */
    row: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end'
    },
    col2: {
        flex: 1,
    },
    colUnit: {
        width: 90,
    },

    /* ── Value box ── */
    valueBox: {
        backgroundColor: theme.card,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: 'center',
        borderWidth: 1
    },
    valueInput: {
        fontSize: 36,
        fontFamily: 'Lexend_800ExtraBold',
        color: theme.text,
        padding: 0,
    },
    unitBox: {
        backgroundColor: theme.backgroundDark,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        marginTop: 29,
    },
    unitText: {
        fontSize: 15,
        fontFamily: 'Lexend_700Bold',
        color: theme.textGray,
        alignSelf: 'center',
        marginTop: 35,
    },

    /* ── Picker boxes (date / time) ── */
    pickerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 14,
        gap: 8,
    },
    pickerText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Lexend_600SemiBold',
        color: theme.text,
    },

    /* ── Save Button ── */
    saveBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        paddingVertical: 18,
        marginTop: 24,
        marginBottom: 16,
    },
    saveBtnText: {
        fontSize: 16,
        fontFamily: 'Lexend_800ExtraBold',
        color: '#fff',
    },

    /* ── Options Pills ── */
    optionsContainer: {
        marginTop: 20,
        marginBottom: 8,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12
    },
    optionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 25,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    optionPillActive: {
        backgroundColor: theme.primarySoft,
        borderColor: theme.primary,
    },
    optionPillText: {
        fontSize: 13,
        fontFamily: 'Lexend_600SemiBold',
        color: theme.textGray,
    },
    optionPillTextActive: {
        color: theme.primary,
    },

    /* ── Footer ── */
    hipaaText: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 10,
    },
});