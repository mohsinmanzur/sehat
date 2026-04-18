import React, { useState } from "react";
import { useTheme } from "@context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "@theme/colors";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ScalePressable } from "../ScalePressable";
import { DashboardMeasurement } from "../../types/others";
import { router } from "expo-router";
import { LineChart } from 'react-native-wagmi-charts'; // 1. Import Wagmi Charts

interface UpdatedMeasurementCardProps {
  id: string;
  item: DashboardMeasurement;
  iconName: string;
  primaryColor: string;
  secondaryColor: string;
  itemHistory: number[];
}

export const UpdatedMeasurementCard: React.FC<UpdatedMeasurementCardProps> = ({ id, item, iconName, primaryColor, secondaryColor, itemHistory }) => {

    const { theme } = useTheme();
    const styles = StylesFunc(theme);
    
    // Default to an initial guess, then update dynamically when the view renders
    const [chartWidth, setChartWidth] = useState(60);
    
    let chartData = [];

    if (!itemHistory || itemHistory.length <= 1) {
        chartData = [{ timestamp: 0, value: itemHistory[0] }, { timestamp: 1, value: itemHistory[0] }];
    }
    else {
        chartData = itemHistory.map((val, index) => ({ timestamp: index, value: val }));
    }

    return (
        <View style={{ flex: 1, backgroundColor: primaryColor, borderRadius: 15, maxWidth: '48%' }} >
            <ScalePressable
                key={id}
                style={{ flex: 1 }}
                disabled={!item}
                onPress={() => router.push({ pathname: `/health_measurements/DetailedView`, params: { data: JSON.stringify(item), primaryColor, secondaryColor } })}
            >
                <View style={[ styles.container, { marginLeft: 0 } ]} >

                    {/* Top Row */}
                    <View style={ styles.topRow }>
                        <FontAwesome5 name={iconName} size={24} color={primaryColor} />

                        {/* Chart*/}
                        <View 
                            style={{ width: '50%', height: 0, marginTop: -15, alignItems: 'flex-end' }}
                            onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
                        >
                            {chartWidth > 0 && (
                                <LineChart.Provider data={chartData}>
                                    <LineChart width={chartWidth} height={90}>
                                        <LineChart.Path color={primaryColor} width={3} />
                                    </LineChart>
                                </LineChart.Provider>
                            )}
                        </View>
                    </View>

                    {/* Title and Value */}
                    <View style={styles.titleRow}>
                        <ThemedText type={'title'} style={styles.value}>{item.numeric_value}</ThemedText>
                        <ThemedText type={'subtitle'} style={styles.unit}> {item.unit.symbol}</ThemedText>
                    </View>

                    <ThemedText type={'subtitle'} style={styles.title}>
                        {item.unit.unit_name}
                    </ThemedText>

                </View>
            </ScalePressable>
        </View>
    )
}

const StylesFunc = (theme: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundLight,
        padding: 20,
        borderRadius: 12,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 50,
    },
    value: {
        color: theme.text,
    },
    unit: {
        marginLeft: 3,
        fontFamily: 'PublicSans_300Light',
    },
    title: {

    }
})