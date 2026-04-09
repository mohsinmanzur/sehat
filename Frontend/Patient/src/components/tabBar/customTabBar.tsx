// components/CustomTabBar.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@context/ThemeContext';
import { Colors } from '@theme/colors';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';

export default function CustomTabBar({ state, descriptors, navigation }: any) {

    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = stylesFunc(theme);

    const TAB_INNER_WIDTH = 240 - 87;
    const TAB_ITEM_WIDTH = TAB_INNER_WIDTH / state.routes.length;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: withSpring(state.index * TAB_ITEM_WIDTH, { duration: 100 }) }]
        };
    });

    const foregroundColor = '#dddddd';

  return (
    <View style={[styles.container, { bottom: insets.bottom + 15}]}>
      {/* Main Tab Pill */}
      <BlurView intensity={80} tint="dark" style={styles.tabBar}>
        <Animated.View style={[styles.slidingBackground, animatedStyle]} />
        
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;
          const Icon = options.tabBarIcon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
            >
              {Icon && Icon({ focused: isFocused, color: foregroundColor, size: 24 })}
              <Text style={[styles.tabText, { color: foregroundColor }]}>
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>

      {/* Floating Action Button */}
      <BlurView intensity={80} tint="dark" style={styles.actionButton}>
        <TouchableOpacity style={styles.actionButtonInner} onPress={() => router.push('/AddNew')}>
            <MaterialIcons name="add" size={30} color={foregroundColor} />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const stylesFunc = (theme: typeof Colors.light) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    width: 240,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    gap: 12,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    height: 60,
    borderRadius: 35,
    overflow: 'hidden',
    paddingHorizontal: 5,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabItem: {
    flex: 1,
    height: 50,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  slidingBackground: {
    position: 'absolute',
    left: 5, // account for paddingHorizontal
    height: 50,
    width: (240) / 3, // dynamically match the width (158 / 3)
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
    zIndex: 0,
  },
  tabText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});