import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PostHogProvider, usePostHog } from 'posthog-react-native'
import { LocationProvider } from '@/contexts/LocationContext'
import { WeatherDataProvider } from '@/contexts/WeatherDataContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import '@/lib/i18n'
import { initLanguage } from '@/lib/i18n'
import { trackAppOpen } from '@/lib/review'
import { Onboarding, ONBOARDING_COMPLETE_KEY } from '@/components/Onboarding'
import { WhatsNew } from '@/components/WhatsNew'
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
  const { t } = useTranslation()
  const router = useRouter()
  const posthog = usePostHog()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showWhatsNew, setShowWhatsNew] = useState(false)

  useEffect(() => {
    initLanguage().then(async () => {
      const [onboardingDone, whatsNewShown] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
        AsyncStorage.getItem('whats_new_shown_v1.2.0'),
      ])
      if (onboardingDone !== 'true') {
        setShowOnboarding(true)
      } else if (whatsNewShown !== 'true') {
        setShowWhatsNew(true)
      }
      SplashScreen.hideAsync()
    })
    trackAppOpen()
  }, [])

  const handleWhatsNewClose = async () => {
    await AsyncStorage.setItem('whats_new_shown_v1.2.0', 'true')
    setShowWhatsNew(false)
  }

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      posthog.capture('notification_tapped')
      router.replace('/(tabs)')
    })
    return () => sub.remove()
  }, [router, posthog])

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
      {showWhatsNew && (
        <WhatsNew
          version="1.2.0"
          features={[
            { emoji: '🗺️', title: t('whatsNew.v120.region.title'), desc: t('whatsNew.v120.region.desc') },
            { emoji: '🌐', title: t('whatsNew.v120.lang.title'), desc: t('whatsNew.v120.lang.desc') },
            { emoji: '🤖', title: t('whatsNew.v120.android.title'), desc: t('whatsNew.v120.android.desc') },
          ]}
          onClose={handleWhatsNewClose}
        />
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
