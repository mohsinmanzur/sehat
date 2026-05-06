import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@context/ThemeContext';
import { Colors } from '@theme/colors';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Shadow } from 'react-native-shadow-2';
import { ScalePressable } from '../ScalePressable';
import { useEffect } from 'react';

export default function CustomTabBar({ state, descriptors, navigation }: any) {

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = stylesFunc(theme);

  const TAB_INNER_WIDTH = 240 - 87;
  const TAB_ITEM_WIDTH = TAB_INNER_WIDTH / state.routes.length;

  const mode = useColorScheme();

  // 0 = Dashboard (Home), 1 = Shares
  const isSharesTab = state.index === 1;

  // Morph progress: 0 = add icon, 1 = share icon
  const morphProgress = useSharedValue(isSharesTab ? 1 : 0);

  useEffect(() => {
    morphProgress.value = withTiming(isSharesTab ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [isSharesTab]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(state.index * TAB_ITEM_WIDTH, { duration: 100 }) }]
    };
  });

  // Add icon fades/scales out as morphProgress goes 0 → 1
  const addIconStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(morphProgress.value, [0, 0.5, 1], [1, 0, 0]),
      transform: [
        { scale: interpolate(morphProgress.value, [0, 1], [1, 0.4]) } as { scale: number },
        { rotate: `${interpolate(morphProgress.value, [0, 1], [0, 90])}deg` } as { rotate: string },
      ],
      position: 'absolute' as const,
    };
  });

  // Share icon fades/scales in as morphProgress goes 0 → 1
  const shareIconStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(morphProgress.value, [0, 0.5, 1], [0, 0, 1]),
      transform: [
        { scale: interpolate(morphProgress.value, [0, 1], [0.4, 1]) } as { scale: number },
        { rotate: `${interpolate(morphProgress.value, [0, 1], [-90, 0])}deg` } as { rotate: string },
      ],
      position: 'absolute' as const,
    };
  });

  const handleFabPress = () => {
    if (isSharesTab) {
      router.push('/NewShare');
    } else {
      router.push('/AddNew');
    }
  };

  const foregroundColor = '#ffffff';

  return (
    <>
      <View pointerEvents="none" style={styles.bottomShadowContainer}>
        <Shadow
          distance={200}
          startColor={'rgb(0, 0, 0, 0)'}
          sides={{ top: true, bottom: false, start: false, end: false }}
          corners={{ topStart: false, topEnd: false, bottomStart: false, bottomEnd: false }}
          style={{ width: '100%', height: 1 }}
          containerStyle={{ width: '100%' }}
        >
          <View style={{ width: '100%', height: 1 }} />
        </Shadow>
      </View>

      <View style={[styles.container, { bottom: insets.bottom + 25 }]}>
        {/* Main Tab Pill */}
        <BlurView intensity={10} tint={'default'} style={[styles.tabBar, mode === 'light' && { backgroundColor: theme.textGray + 60 }]}>
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
              <ScalePressable
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
              </ScalePressable>
            );
          })}
        </BlurView>

        {/* Floating Action Button */}
        <BlurView intensity={10} tint={'default'} style={[styles.actionButton, mode === 'light' && { backgroundColor: theme.textGray + 60 }]}>
          <ScalePressable style={styles.actionButtonInner} onPress={handleFabPress}>
            <Animated.View style={addIconStyle}>
              <MaterialIcons name="add" size={30} color={foregroundColor} />
            </Animated.View>
            <Animated.View style={shareIconStyle}>
              <MaterialIcons name="share" size={24} color={foregroundColor} />
            </Animated.View>
          </ScalePressable>
        </BlurView>
      </View>
    </>
  );
}

const stylesFunc = (theme: typeof Colors.light) => StyleSheet.create({
  bottomShadowContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 0,
  },
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
  shadow: {
    flex: 1,
    borderRadius: 35,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    height: 60,
    borderRadius: 35,
    overflow: 'hidden',
    paddingHorizontal: 5,
    alignItems: 'center',
    borderWidth: theme.card === '#F3F3F4' ? 1 : 0.5,
    borderColor: '#ffffffa8',
    backgroundColor: 'transparent'
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    borderWidth: theme.card === '#F3F3F4' ? 1 : 0.5,
    borderColor: '#ffffffa8',
    backgroundColor: 'transparent'
  },
  actionButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});