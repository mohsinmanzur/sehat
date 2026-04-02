import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { SharedTransition } from 'react-native-reanimated';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const fastTransition = SharedTransition.springify().duration(250);

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome5);
import { useTheme } from 'src/context/ThemeContext';
import { ThemedView } from 'src/components';

export default function HealthMeasurementDetailScreen() {
  const { id, data } = useLocalSearchParams<{ id: string, data?: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  let measurement = null;
  if (data) {
    try {
      measurement = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse measurement data", e);
    }
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

  // Determine colors based on status
  let themeColor = theme.primary;
  let lightThemeColor = theme.primarySoft;

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
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroContent}>
        <Animated.View
          sharedTransitionTag={`icon-bg-${id}`}
          sharedTransitionStyle={fastTransition}
          style={[styles.iconBox, { backgroundColor: lightThemeColor }]}
          collapsable={false}
        >
          <AnimatedIcon
            sharedTransitionTag={`icon-glyph-${id}`}
            sharedTransitionStyle={fastTransition}
            name={measurement.iconName}
            size={20}
            color={themeColor}
          />
        </Animated.View>

        <Text style={[styles.heroTitle, { color: theme.text }]}>
          {measurement.unit.unit_name}
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: lightThemeColor }]}>
          <Text style={[styles.statusText, { color: themeColor }]}>{measurement.status}</Text>
        </View>
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
          <Text style={[styles.detailLabel, { color: theme.textGray }]}>Doctor's Note / Insight</Text>
          <Text style={[styles.detailDescription, { color: theme.text }]}>{measurement.ai_insight}</Text>
        </View>
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
    paddingTop: 15,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 16,
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
});
