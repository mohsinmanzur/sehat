import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from 'src/components';
import DatePicker from 'react-native-date-picker';
import { Dropdown } from 'src/components/common/Dropdown';
import backend from 'src/services/Backend/backend.service';
import { MeasurementUnitDTO } from '../../src/types/dto';
import LoadingScreen from 'src/components/LoadingScreen';
import { useCurrentPatient } from '@context/PatientContext';
import { formatOrdinalDate, formatTime } from 'src/utils/date';
import { errorShakeAnimation } from 'src/animations/animations';
import { ScalePressable } from 'src/components/ScalePressable';

export default function AddNewMeasurement() {
    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient()
    const router = useRouter();

    const [selectedUnit, setSelectedUnit] = useState<MeasurementUnitDTO | null>(null);
    const [value, setValue] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [showSelectedUnitError, setShowSelectedUnitError] = useState(false);
    const [showValueError, setShowValueError] = useState(false);

    const [isLoading, setisLoading] = useState(true);

    const [pickerOpen, setPickerOpen] = useState<'date' | 'time' | null>(null);
    const [units, setUnits] = useState<MeasurementUnitDTO[]>([]);

    const valueShakeAnimation = useRef(new Animated.Value(0)).current;
    const dropdownShakeAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        backend.getMeasurementUnits().then((units) => {
            setUnits(units);
            setisLoading(false);
        });
    }, []);

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
        setShowSelectedUnitError(false);
        setShowValueError(false);
        await backend.createHealthMeasurement({
            patient_id: currentPatient?.id,
            unit_id: selectedUnit?.id,
            numeric_value: parseFloat(value),
            created_at: selectedDate,
        })
        router.back();
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
                <TouchableOpacity onPress={() => router.back()} style={s.headerIcon}>
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
                    options={units.map((unit) => unit.unit_name)}
                    value={selectedUnit?.unit_name}
                    onChange={(value) => { setSelectedUnit(units.find((unit) => unit.unit_name === value) || null); setShowSelectedUnitError(false); }}
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
                                onChangeText={(text) => { setValue(text); setShowValueError(false); }}
                                keyboardType="numeric"
                                placeholderTextColor={theme.textVeryLight}
                                placeholder='0.00'
                                maxLength={6}
                                cursorColor={theme.primary}
                            />
                        </Animated.View>
                    </View>

                    <ThemedText style={s.unitText} type={'subtitle'}>{selectedUnit?.symbol}</ThemedText>
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
                            <Text style={s.saveBtnText}>Save Measurement</Text>
                            <MaterialIcons name="save" size={20} color="#fff" style={{ marginLeft: 8 }} />
                        </ScalePressable>
                    </View>

                    <Pressable
                        style={({ pressed }) => [s.iconBox, { backgroundColor: theme.primarySoft, marginRight: 0, marginTop: 8, opacity: pressed ? 0.8 : 1 }]}
                        collapsable={false}
                        onPress={handleAddPhoto}
                    >
                        <MaterialIcons
                            name="add-a-photo"
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

    /* ── Footer ── */
    hipaaText: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 10,
    },
});