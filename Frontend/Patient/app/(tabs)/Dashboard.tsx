import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, RefreshControl } from 'react-native';
import { useCurrentPatient } from 'src/context/PatientContext';
import { useTheme } from 'src/context/ThemeContext';
import { Header, MeasurementCard } from 'src/components/dashboard';
import { ThemedView } from 'src/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardMeasurement } from 'src/types/others';
import backend from 'src/services/Backend/backend.service';
import LoadingScreen from 'src/components/LoadingScreen';
import { ScalePressable } from 'src/components/ScalePressable';
import { router, useFocusEffect } from 'expo-router';
import { formatDate } from 'src/utils/date';

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentPatient } = useCurrentPatient();
  const insets = useSafeAreaInsets();
  const patientName = currentPatient?.name?.split(' ')[0] || 'Arjun';

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [measurements, setMeasurements] = useState<DashboardMeasurement[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  const fetchMeasurements = async () => {
    if (currentPatient?.id) {
      try {
        const data = await backend.getMeasurementsByPatient(currentPatient.id);
        setMeasurements(data || []);

        const units = Array.from(new Set(data.map((m: DashboardMeasurement) => m.unit.unit_name)));
        setUnits(units as string[]);
      } catch (error) {
        console.error("Error fetching measurements:", error);
      }
    } else {
      setMeasurements([]);
    }
  };

  const getLatest = (keyword: string) => {
    return measurements
      .filter(m => m.unit.unit_name.match(keyword))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  useFocusEffect(
    useCallback(() => {
      fetchMeasurements().finally(() => setIsLoading(false));
    }, [currentPatient?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeasurements();
    setRefreshing(false);
  };

  return (
    isLoading ? <LoadingScreen /> : (

      <ThemedView style={[styles.safeArea, { backgroundColor: theme.backgroundDark, paddingTop: insets.top }]} >
        <View style={styles.mainContainer}>
          {/* Header */}
          <Header name={patientName} />

          {/* Recent Documents Header */}
          <View style={[styles.sectionHeader, { marginTop: 20, marginHorizontal: 7 }]}>
            <Text style={[styles.sectionTitle, { color: theme.textGray }]}>HEALTH MEASUREMENTS</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
                progressBackgroundColor={theme.backgroundLight}
              />
            }
          >
            <View style={styles.cardWrapper}>

              {units.map((unit, index) => {
                const latest = getLatest(unit);
                const iconName = unit === 'Blood Sugar' ? 'tint' :
                  unit === 'Blood Pressure' ? 'heartbeat' :
                    unit === 'Weight' ? 'weight' :
                      unit === 'Heart Rate' ? 'heartbeat' : 'activity';
                
                const primaryColor = theme.items[index % theme.items.length].primary;
                const secondaryColor = theme.items[index % theme.items.length].secondary;
                return (
                  <ScalePressable
                    key={index}
                    disabled={!latest}
                    onPress={() => router.push({ pathname: `/health_measurements/DetailedView`, params: { data: JSON.stringify(latest), primaryColor, secondaryColor } })}
                  >
                    <MeasurementCard
                      id={unit.toLowerCase().replace(/\s/g, '_')}
                      title={unit}
                      value={latest?.numeric_value?.toString() || '--'}
                      unit={latest?.unit?.symbol || ''}
                      dateStr={formatDate(latest?.created_at)}
                      iconName={iconName}
                      color={primaryColor}
                      colorSecondary={secondaryColor}
                    />
                  </ScalePressable>
                )
              })}
            </View>

            {/* Smart Insight Card */}
            {/*<InsightCard />*/}

            {/* Share with Doctor */}
            {/*<ShareCard />*/}

          </ScrollView>

          {/* Floating Action Button */}
          {/* <FloatingActionButton /> */}
        </View>
      </ThemedView>
    )
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardWrapper: {
    marginBottom: 80,
    marginHorizontal: 6,
    gap: 5,
  },
});

export default DashboardScreen;
