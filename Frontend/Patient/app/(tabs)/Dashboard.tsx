import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, RefreshControl, Pressable } from 'react-native';
import { useCurrentPatient } from 'src/context/PatientContext';
import { useTheme } from 'src/context/ThemeContext';
import { Header, MeasurementCard, FloatingActionButton, StatusTag } from 'src/components/dashboard';
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

      <ThemedView style={[styles.safeArea, { backgroundColor: theme.backgroundLight, paddingTop: insets.top }]} >
        <View style={styles.mainContainer}>
          {/* Header */}
          <Header name={patientName} />

          {/* Recent Documents Header */}
          <View style={[styles.sectionHeader, { marginTop: 20, marginHorizontal: 7 }]}>
            <Text style={[styles.sectionTitle, { color: theme.textGray }]}>HEALTH MEASUREMENTS</Text>
            <TouchableOpacity>
              {/*<Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>*/}
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
            {(() => {
              const getLatest = (keywords: string[]) => {
                return measurements
                  .filter(m => keywords.some(k => m.unit.unit_name.toLowerCase().includes(k)))
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
              };

              const bs = getLatest(['sugar']);
              const bp = getLatest(['pressure']);
              const wt = getLatest(['weight']);
              const hr = getLatest(['heart', 'pulse']);


              return (
                <View style={styles.cardWrapper}>
                  <ScalePressable
                    disabled={!bs}
                    onPress={() => router.push({ pathname: `/health_measurements/DetailedView`, params: { data: JSON.stringify(bs) } })}
                  >
                    <MeasurementCard
                      id={bs?.id || 'blood_sugar'}
                      title={'Blood Sugar'}
                      value={bs?.numeric_value?.toString() || '--'}
                      unit={bs?.unit?.symbol || 'mg/dL'}
                      dateStr={formatDate(bs?.created_at)}
                      iconName={'tint'}
                      color={theme.danger}
                      colorSecondary={theme.dangerLight}
                    />
                  </ScalePressable>

                  <ScalePressable
                    disabled={!bp}
                    onPress={() => router.push({ pathname: `/health_measurements/DetailedView`, params: { data: JSON.stringify(bp) } })}
                  >
                    <MeasurementCard
                      id={bp?.id || 'blood_pressure'}
                      title={'Blood Pressure'}
                      value={bp?.numeric_value?.toString() || '--'}
                      unit={bp?.unit?.symbol || 'mmHg'}
                      dateStr={formatDate(bp?.created_at)}
                      iconName={'heartbeat'}
                      color={theme.primary}
                      colorSecondary={theme.primarySoft}
                    />
                  </ScalePressable>

                  <ScalePressable
                    disabled={!wt}
                    onPress={() => router.push({ pathname: `/health_measurements/DetailedView`, params: { data: JSON.stringify(wt) } })}
                  >
                    <MeasurementCard
                      id={wt?.id || 'weight'}
                      title={'Weight'}
                      value={wt?.numeric_value?.toString() || '--'}
                      unit={wt?.unit?.symbol || 'kg'}
                      dateStr={formatDate(wt?.created_at)}
                      iconName={'weight'}
                      color={theme.warning}
                      colorSecondary={theme.warningLight}
                    />
                  </ScalePressable>

                  <ScalePressable
                    disabled={!hr}
                    onPress={() => router.push({ pathname: `/health_measurements/DetailedView`, params: { data: JSON.stringify(hr) } })}
                  >
                    <MeasurementCard
                      id={hr?.id || 'heart_rate'}
                      title={'Heart Rate'}
                      value={hr?.numeric_value?.toString() || '--'}
                      unit={hr?.unit?.symbol || 'bpm'}
                      dateStr={formatDate(hr?.created_at)}
                      iconName={'heartbeat'}
                      color={theme.success}
                      colorSecondary={theme.successLight}
                    />
                  </ScalePressable>
                </View>
              );
            })()}

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
    marginBottom: 4,
    marginHorizontal: 6,
    gap: 5,
  },
});

export default DashboardScreen;
