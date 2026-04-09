import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { PostHogProvider } from 'posthog-react-native'
import { LocationProvider } from '@/contexts/LocationContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import '@/lib/i18n'
import { initLanguage } from '@/lib/i18n'
import 'react-native-reanimated'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

function InnerLayout() {
  const { isDark } = useTheme()

  useEffect(() => {
    initLanguage().then(() => SplashScreen.hideAsync())
  }, [])

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY!}
      options={{ host: process.env.EXPO_PUBLIC_POSTHOG_HOST, disabled: __DEV__ }}
    >
      <ThemeProvider>
        <LocationProvider>
          <InnerLayout />
        </LocationProvider>
      </ThemeProvider>
    </PostHogProvider>
  )
}
