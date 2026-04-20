import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';
import { SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { userSvg } from "../../constants/avatars";

interface HeaderProps {
  name: string;
  avatarUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ name, avatarUrl }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.leftSection, {opacity: pressed ? 0.7 : 1}]} onPress={() => router.push('/Profile')}>
        <View style={[styles.avatar, { overflow: 'hidden' }]}>
          <SvgXml xml={userSvg} width="100%" height="100%" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.welcomeText, { color: theme.textLight }]}>WELCOME BACK</Text>
          <Text style={[styles.nameText, { color: theme.text }]}>Hello, {name}</Text>
        </View>
      </Pressable>
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications" size={24} color={theme.textGray} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 24,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
  },
  notificationButton: {
    padding: 8,
  },
});
