import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || 'https://successful-shrimp-557.convex.cloud';
const convex = new ConvexReactClient(CONVEX_URL);

const webStorage = {
  getItem: async (key: string) => {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // silently fail
    }
  },
  removeItem: async (key: string) => {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // silently fail
    }
  },
};

const nativeSecureStorage = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // silently fail
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // silently fail
    }
  },
};

const authStorage = Platform.OS === 'web' ? webStorage : nativeSecureStorage;

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ConvexAuthProvider client={convex} storage={authStorage}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
            <Stack.Screen name="care-summary" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          </Stack>
        </ConvexAuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
