import React from 'react';
import { StyleSheet, View, RefreshControl, FlatList, Text } from 'react-native';
import { useCurrentPatient } from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../../components/dashboard';
import { ThemedView } from '../../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HealthMeasurement } from '../../types/types';
import { UpdatedMeasurementCard } from '../../components/dashboard/UpdatedMeasurementCard';
import { iconMap } from '../../constants/general';
import { SkeletonCard } from '../../components/dashboard/SkeletonCard';
import { useMeasurements } from '../../hooks/useMeasurements';
import { useDeviceOnlySetting } from '../../hooks/useDeviceOnlySetting';
import { OfflineBanner } from '../../components/common/OfflineBanner';
import { DeviceOnlyBanner } from '../../components/common/DeviceOnlyBanner';
import { useNetwork } from '../../context/NetworkContext';

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentPatient } = useCurrentPatient();
  const { isOnline } = useNetwork();
  const insets = useSafeAreaInsets();
  const patientName = currentPatient?.name?.split(' ')[0] || 'Arjun';

  const { measurements, isLoading, isSyncing, refresh } = useMeasurements(currentPatient?.id);
  const { isDeviceOnly } = useDeviceOnlySetting(currentPatient?.id);

  const [refreshing, setRefreshing] = React.useState(false);

  const units = [...new Set(measurements.map((m: HealthMeasurement) => m.measurement_unit?.measurement_group).filter(Boolean))].reverse() as string[];

  const getLatest = (keyword: string, unit_name?: string) => {
    return measurements
      .filter(m => {
        const groupMatch = m.measurement_unit?.measurement_group?.match(keyword);
        if (unit_name) {
          return groupMatch && m.measurement_unit?.unit_name === unit_name;
        }
        return groupMatch;
      })
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())[0];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Show "connect once" empty state only when SQLite is empty, offline, and not device-only
  const showConnectPrompt = !isLoading && measurements.length === 0 && !isOnline && !isDeviceOnly;

  return (
    <ThemedView safe style={{ backgroundColor: theme.backgroundDark, paddingTop: insets.top }} >
      <OfflineBanner />
      <DeviceOnlyBanner isDeviceOnly={isDeviceOnly} />
      <View style={styles.mainContainer}>
        <Header name={patientName} />

        <View style={[styles.sectionHeader, { marginTop: 10, marginHorizontal: 7 }]} />

        {isLoading ? (
          <FlatList
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => item.toString()}
            numColumns={2}
            columnWrapperStyle={styles.cardWrapper}
            renderItem={() => <SkeletonCard />}
          />
        ) : (
          <FlatList
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            data={showConnectPrompt ? [] : units}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            columnWrapperStyle={styles.cardWrapper}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isSyncing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
                progressBackgroundColor={theme.backgroundLight}
              />
            }
            ListEmptyComponent={
              showConnectPrompt ? (
                <View style={styles.emptyContainer}>
                  <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No offline data found</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.textGray }]}>
                      Connect to the internet to sync your measurements.
                    </Text>
                  </View>
                </View>
              ) : null
            }
            renderItem={({ item: unit, index }) => {
              const latest = unit === 'Blood Pressure' ? getLatest(unit, 'Systolic') : getLatest(unit);
              const secondaryLatest = unit === 'Blood Pressure' ? getLatest(unit, 'Diastolic') : undefined;
              const iconName = iconMap[unit] || 'activity';

              const primaryColor = theme.items[index % theme.items.length].primary;
              const secondaryColor = theme.items[index % theme.items.length].secondary;

              let fullHistory = measurements
                .filter(m => m.measurement_unit?.measurement_group === unit)
                .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());

              let itemHistory = fullHistory;
              if (unit === 'Blood Pressure') {
                itemHistory = fullHistory.filter(m => m.measurement_unit?.unit_name === 'Systolic');
              }

              return (
                <UpdatedMeasurementCard
                  id={unit.toLowerCase().replace(/\s/g, '_')}
                  item={latest}
                  secondaryItem={secondaryLatest}
                  iconName={iconName}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  itemHistory={itemHistory}
                  fullHistory={fullHistory}
                  pathname='/health_measurements/DetailedView'
                />
              );
            }}
            ListFooterComponent={<View style={{ height: 80 }} />}
          />
        )}
      </View>
    </ThemedView>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  cardWrapper: {
    marginHorizontal: 15,
    marginVertical: 7,
    gap: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyBox: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Lexend_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DashboardScreen;
