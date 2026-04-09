import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { LocationProvider } from '@/contexts/LocationContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import 'react-native-reanimated'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

function InnerLayout() {
  const { isDark } = useTheme()

  useEffect(() => {
    SplashScreen.hideAsync()
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
    <ThemeProvider>
      <LocationProvider>
        <InnerLayout />
      </LocationProvider>
    </ThemeProvider>
  )
}
