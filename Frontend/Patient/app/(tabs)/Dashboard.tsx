import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, RefreshControl, FlatList } from 'react-native';
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
import { UpdatedMeasurementCard } from 'src/components/dashboard/UpdatedMeasurementCard';

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

      <ThemedView safe style={{ backgroundColor: theme.backgroundDark, paddingTop: insets.top }} >
        <View style={styles.mainContainer}>
          {/* Header */}
          <Header name={patientName} />

          {/* Recent Documents Header */}
          <View style={[styles.sectionHeader, { marginTop: 10, marginHorizontal: 7 }]}>
            {/* <Text style={[styles.sectionTitle, { color: theme.textGray }]}>HEALTH MEASUREMENTS</Text> */}
          </View>

          <FlatList
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            data={units}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            columnWrapperStyle={styles.cardWrapper}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
                progressBackgroundColor={theme.backgroundLight}
              />
            }
            renderItem={({ item: unit, index }) => {
            
              const latest = getLatest(unit);
              const iconName = unit === 'Blood Sugar' ? 'tint' :
                unit === 'Blood Pressure' ? 'heartbeat' :
                  unit === 'Weight' ? 'weight' :
                    unit === 'Heart Rate' ? 'stethoscope' : 'activity';
              
              const primaryColor = theme.items[index % theme.items.length].primary;
              const secondaryColor = theme.items[index % theme.items.length].secondary;

              const itemHistory = measurements
                .filter(m => m.unit.unit_name === unit)
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // oldest to newest
                .map(m => m.numeric_value);

              return (
                  <UpdatedMeasurementCard
                    id={unit.toLowerCase().replace(/\s/g, '_')}
                    item={latest}
                    iconName={iconName}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    itemHistory={itemHistory}
                  />
              )
            }
          }
          ListFooterComponent={
              <View style={{ height: 80 }}>
                {/* Smart Insight Card */}
                {/* Share with Doctor */}
              </View>
          }
          />
        </View>
      </ThemedView>
    )
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    marginBottom: 80,
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
  cardWrapper: {
    marginHorizontal: 15,
    marginVertical: 7,
    gap: 15,
  },
});

export default DashboardScreen;
