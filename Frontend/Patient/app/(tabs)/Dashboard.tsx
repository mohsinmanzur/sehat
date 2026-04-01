import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useCurrentPatient } from 'src/context/PatientContext';
import { useTheme } from 'src/context/ThemeContext';
import { Header, MeasurementCard, FloatingActionButton, StatusTag } from 'src/components/dashboard';
import { Link } from 'expo-router';
import { ThemedView } from 'src/components';
import { DashboardMeasurement } from 'src/types/others';
import backend from 'src/services/Backend/backend.service';
import LoadingScreen from 'src/components/LoadingScreen';
import { ScalePressable } from 'src/components/ScalePressable';
import Animated from 'react-native-reanimated';

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentPatient } = useCurrentPatient();
  const patientName = currentPatient?.name?.split(' ')[0] || 'Arjun';

  const [isLoading, setIsLoading] = useState(true);
  const [measurements, setMeasurements] = useState<DashboardMeasurement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeasurements = async () => {
    if (currentPatient?.id) {
      try {
        const data = await backend.getMeasurementsByPatient(currentPatient.id);
        setMeasurements(data || []);
      } catch (error) {
        console.error("Error fetching measurements:", error);
      }
    } else {
      setMeasurements([]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMeasurements().finally(() => setIsLoading(false));
  }, [currentPatient?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeasurements();
    setRefreshing(false);
  };

  return (
    isLoading ? <LoadingScreen /> : (

      <ThemedView safe style={[styles.safeArea, { backgroundColor: theme.backgroundLight }]} >
        <View style={styles.mainContainer}>
          {/* Header */}
          <Header name={patientName} />

          {/* Recent Documents Header */}
          <View style={[styles.sectionHeader, { marginTop: 20, marginHorizontal: 7 }]}>
            <Text style={[styles.sectionTitle, { color: theme.textGray }]}>HEALTH MEASUREMENTS</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
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

            {/* Documents List */}
            {measurements.map((meas) => {
              // Reformat the date for display
              const dateObj = new Date(meas.created_at);
              const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const displayValue = `${meas.numeric_value} ${meas.unit.symbol}`;

              let computedStatus: StatusTag = 'Normal';
              if (meas.anomaly_detected || meas.severity_score > 7) computedStatus = 'Requires Review';
              else if (meas.severity_score > 4 || Number(meas.numeric_value) > Number(meas.max_value) || Number(meas.numeric_value) < Number(meas.min_value)) computedStatus = 'Elevated';
              else if (!meas.numeric_value && !meas.id) computedStatus = 'Completed';

              let computedIconName = 'file-medical-alt';
              if (meas.unit.unit_name?.toLowerCase().includes('blood')) computedIconName = 'tint';
              if (meas.unit.unit_name?.toLowerCase().includes('pressure')) computedIconName = 'heartbeat';
              if (meas.unit.unit_name?.toLowerCase().includes('heart')) computedIconName = 'stethoscope';
              if (meas.unit.unit_name?.toLowerCase().includes('weight')) computedIconName = 'weight';

              const payload = {
                ...meas,
                status: computedStatus,
                iconName: computedIconName
              };

              return (
                <Link
                  href={{
                    pathname: `/(tabs)/${meas.id}`,
                    params: { data: JSON.stringify(payload) }
                  }}
                  asChild
                  key={meas.id}
                >
                  <ScalePressable style={styles.cardWrapper}>
                    <MeasurementCard
                      id={meas.id}
                      title={meas.unit.unit_name}
                      type={meas.special_condition}
                      value={displayValue}
                      status={computedStatus}
                      dateStr={displayDate}
                      iconName={computedIconName}
                    />
                  </ScalePressable>
                </Link>
              );
            })}

            {/* Smart Insight Card */}
            {/*<InsightCard />*/}

            {/* Share with Doctor */}
            {/*<ShareCard />*/}

          </ScrollView>

          {/* Floating Action Button */}
          <FloatingActionButton />
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
    paddingBottom: 40,
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
    marginBottom: 5,
    marginHorizontal: 6,
  },
});

export default DashboardScreen;
