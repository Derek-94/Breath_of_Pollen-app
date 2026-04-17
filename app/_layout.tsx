import { useEffect, useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PostHogProvider } from 'posthog-react-native'
import { LocationProvider } from '@/contexts/LocationContext'
import { WeatherDataProvider } from '@/contexts/WeatherDataContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import '@/lib/i18n'
import { initLanguage } from '@/lib/i18n'
import { trackAppOpen } from '@/lib/review'
import { Onboarding, ONBOARDING_COMPLETE_KEY } from '@/components/Onboarding'
import 'react-native-reanimated'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

function InnerLayout() {
  const { isDark } = useTheme()
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    initLanguage().then(async () => {
      const done = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
      if (done !== 'true') setShowOnboarding(true)
      SplashScreen.hideAsync()
    })
    trackAppOpen()
  }, [])

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.replace('/(tabs)')
    })
    return () => sub.remove()
  }, [router])

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
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
          <WeatherDataProvider>
            <InnerLayout />
          </WeatherDataProvider>
        </LocationProvider>
      </ThemeProvider>
    </PostHogProvider>
  )
}
