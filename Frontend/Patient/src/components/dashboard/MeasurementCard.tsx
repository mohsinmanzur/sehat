import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';
import { StatusTag } from './DocumentCard';
import Animated from 'react-native-reanimated';

interface MeasurementCardProps {
  id: string;
  title: string;
  type: string;
  value: string;
  status: StatusTag;
  dateStr: string;
  iconName: string;
}

export const MeasurementCard: React.FC<MeasurementCardProps> = ({ id, title, type, value, status, dateStr, iconName }) => {
  const { theme } = useTheme();

  // Determine colors based on status
  let themeColor = theme.primary;
  let lightThemeColor = theme.primarySoft;

  switch (status) {
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
      if (status === 'Requires Review' || status as string === 'High') {
        themeColor = theme.danger;
        lightThemeColor = theme.dangerLight;
      }
      break;
  }
  // Hard override just in case 'Requires Review' needs red:
  if (status === 'Requires Review') {
    themeColor = theme.danger;
    lightThemeColor = theme.dangerLight;
  }

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.card === '#20201F' ? '#2A2A29' : '#FFFFFF' }]}>
      {/* Colored left border indicator */}
      <View style={[styles.leftBorderIndicator, { backgroundColor: themeColor }]} />

      <View style={styles.cardContent}>
        {/* Leading Icon Box */}
        <Animated.View
          sharedTransitionTag={`icon-${id}`}
          style={[styles.iconBox, { backgroundColor: lightThemeColor }]}
        >
          <FontAwesome5 name={iconName} size={20} color={themeColor} />
        </Animated.View>

        {/* Title and Badge Columns */}
        <View style={styles.textColumn}>

          <Animated.Text
            sharedTransitionTag={`title-${id}`}
            style={[styles.titleText, { color: theme.text }]}
          //numberOfLines={1}
          >
            {title}
          </Animated.Text>

          <View style={styles.tagsRow}>
            <Text style={[styles.valueText, { color: theme.textLight }]}>{value}</Text>
          </View>
        </View>

        {/* Right Status Badge and Chevron */}
        <View style={styles.rightColumn}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={theme.textLight} />
            <Text style={[styles.dateText, { color: theme.textLight }]}>{dateStr}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    marginHorizontal: 0, // In lists, padding might be handled differently, kept to 0 here to allow Animated parent margins
    marginBottom: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  leftBorderIndicator: {
    width: 6,
    alignSelf: 'stretch',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '800',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
