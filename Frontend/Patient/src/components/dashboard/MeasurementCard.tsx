import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';
import Animated, { SharedTransition, withTiming } from 'react-native-reanimated';
import { InsightCard } from './InsightCard';

const fastTransition = SharedTransition.springify().duration(250);

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome5);

interface MeasurementCardProps {
  id: string;
  title: string;
  value: string;
  unit: string;
  dateStr: string;
  iconName: string;
  color: string;
  colorSecondary: string;
}

export const MeasurementCard: React.FC<MeasurementCardProps> = ({ id, title, value, unit, dateStr, iconName, color, colorSecondary }) => {
  const { theme } = useTheme();

  // Determine colors based on status
  let themeColor = value === '--' ? theme.textLight : color;
  let lightThemeColor = value === '--' ? theme.card : colorSecondary;

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.card === '#20201F' ? '#2A2A29' : '#FFFFFF' }]}>
      {/* Colored left border indicator */}
      <View style={[styles.leftBorderIndicator, { backgroundColor: themeColor }]} />

      <View style={styles.cardContent}>
        {/* Leading Icon Box */}
        <Animated.View
          sharedTransitionTag={`icon-bg-${id}`}
          sharedTransitionStyle={fastTransition}
          style={[styles.iconBox, { backgroundColor: lightThemeColor }]}
          collapsable={false}
        >
          <AnimatedIcon
            sharedTransitionTag={`icon-glyph-${id}`}
            sharedTransitionStyle={fastTransition}
            name={iconName}
            size={22}
            color={themeColor}
          />
        </Animated.View>

        {/* Title and Badge Columns */}
        <View style={styles.textColumn}>

          <Text style={[styles.titleText, { color: theme.text }]} >
            {title}
          </Text>

          <View style={styles.tagsRow}>
            <Text style={[styles.valueText, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.unitText, { color: theme.textLight }]}>{unit}</Text>
          </View>
        </View>

        {/* Right Status Badge and Chevron */}
        <View style={styles.rightColumn}>
          <View style={styles.dateRow}>
            {/*<Ionicons name="calendar-outline" size={12} color={theme.textLight} />
            <Text style={[styles.dateText, { color: theme.textLight }]}>{dateStr}</Text> */}
            <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
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
    elevation: 1,
  },
  leftBorderIndicator: {
    width: 6,
    alignSelf: 'stretch',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
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
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
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
    fontFamily: 'PublicSans_800ExtraBold',
    fontSize: 16,
  },
  unitText: {
    fontFamily: 'Lexend_500Bold',
    fontSize: 12,
    marginLeft: 5,
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
