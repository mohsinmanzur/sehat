import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@context/ThemeContext';
import { Colors } from '@theme/colors';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Shadow } from 'react-native-shadow-2';
import { ScalePressable } from '../ScalePressable';

export default function CustomTabBar({ state, descriptors, navigation }: any) {

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = stylesFunc(theme);

  const TAB_INNER_WIDTH = 240 - 87;
  const TAB_ITEM_WIDTH = TAB_INNER_WIDTH / state.routes.length;

  const mode = useColorScheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(state.index * TAB_ITEM_WIDTH, { duration: 100 }) }]
    };
  });

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
          <ScalePressable style={styles.actionButtonInner} onPress={() => router.push('/AddNew')}>
            <MaterialIcons name="add" size={30} color={foregroundColor} />
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