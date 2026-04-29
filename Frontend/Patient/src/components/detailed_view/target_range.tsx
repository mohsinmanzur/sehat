import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';

const TargetRange = ({ color = '#4a5982', minValue = 80, maxValue = 120, value = 110 }) => {
    const healthyRangeWidth = ((maxValue - minValue) / minValue) * 100;
    const sideWidth = (100 - healthyRangeWidth) / 2;

    const getMarkerPosition = (): DimensionValue => {
        if (value < minValue) {
            return `${(value / minValue) * sideWidth}%`;
        }
        if (value <= maxValue) {
            return `${sideWidth + ((value - minValue) / (maxValue - minValue)) * healthyRangeWidth}%`;
        }
        const rightSpread = minValue;
        const excess = Math.min(value - maxValue, rightSpread);
        return `${sideWidth + healthyRangeWidth + (excess / rightSpread) * sideWidth}%`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.bar}>
                <View style={{ width: `${sideWidth}%` as DimensionValue, backgroundColor: color + '40' }} />
                <View style={{ width: `${healthyRangeWidth}%` as DimensionValue, backgroundColor: color }} />
                <View style={{ width: `${sideWidth}%` as DimensionValue, backgroundColor: color + '40' }} />
            </View>

            <View style={[styles.markerWrapper, { left: getMarkerPosition() }]}>
                <View style={styles.markerLine} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '50%',
        position: 'relative',
        paddingVertical: 10,
    },
    bar: {
        flexDirection: 'row',
        width: '100%',
        height: 10,
        borderRadius: 10,
        overflow: 'hidden'
    },
    markerWrapper: {
        position: 'absolute',
        top: 7,
        alignItems: 'center',
        transform: [{ translateX: -6 }],
    },
    markerLine: {
        width: 4,
        height: 14,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
});

export default TargetRange;