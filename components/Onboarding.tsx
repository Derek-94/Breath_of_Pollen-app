import { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import {
  requestNotificationPermission,
  NOTIF_ENABLED_KEY,
  NOTIF_HOUR_KEY,
  NOTIF_MINUTE_KEY,
  DEFAULT_EVENING_HOUR,
  DEFAULT_EVENING_MINUTE,
} from '@/lib/notifications'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
export const ONBOARDING_COMPLETE_KEY = 'onboarding_complete'


interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const pageRef = useRef(0)
  const [notifDate, setNotifDate] = useState(() => {
    const d = new Date(); d.setHours(DEFAULT_EVENING_HOUR, DEFAULT_EVENING_MINUTE, 0, 0); return d
  })
  const slideAnim = useRef(new Animated.Value(0)).current

  const goToPage = (next: number) => {
    pageRef.current = next
    setPage(next)
    Animated.timing(slideAnim, {
      toValue: -next * SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10,
      onPanResponderMove: (_, { dx }) => {
        const currentOffset = -pageRef.current * SCREEN_WIDTH
        const next = currentOffset + dx
        if (next <= 0 && next >= -SCREEN_WIDTH) {
          slideAnim.setValue(next)
        }
      },
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -50 && pageRef.current === 0) {
          goToPage(1)
        } else if (dx > 50 && pageRef.current === 1) {
          goToPage(0)
        } else {
          goToPage(pageRef.current)
        }
      },
    })
  ).current

  const complete = async (enableNotif: boolean) => {
    if (enableNotif) {
      const granted = await requestNotificationPermission()
      if (granted) {
        await AsyncStorage.multiSet([
          [NOTIF_ENABLED_KEY, 'true'],
          [NOTIF_HOUR_KEY, String(notifDate.getHours())],
          [NOTIF_MINUTE_KEY, String(notifDate.getMinutes())],
        ])
      }
    }
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
    onComplete()
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.overflow} {...panResponder.panHandlers}>
        <Animated.View
          style={[styles.pagesRow, { transform: [{ translateX: slideAnim }] }]}
        >
          {/* Page 1: Intro */}
          <View style={styles.page}>
            <Text style={styles.emoji}>🌿</Text>
            <Text style={[styles.title, isDark && styles.textDark]}>
              {t('onboarding.intro.title')}
            </Text>
            <Text style={[styles.body, isDark && styles.textMuted]}>
              {t('onboarding.intro.body')}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={() => goToPage(1)}
            >
              <Text style={styles.primaryButtonText}>{t('onboarding.intro.next')}</Text>
            </Pressable>
          </View>

          {/* Page 2: Notification */}
          <View style={styles.page}>
            <Text style={styles.emoji}>🔔</Text>
            <Text style={[styles.title, isDark && styles.textDark]}>
              {t('onboarding.notif.title')}
            </Text>
            <Text style={[styles.body, isDark && styles.textMuted]}>
              {t('onboarding.notif.body')}
            </Text>

            <DateTimePicker
              value={notifDate}
              mode="time"
              display="spinner"
              onChange={(_, date) => { if (date) setNotifDate(date) }}
              style={{ width: '100%' }}
            />

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={() => complete(true)}
            >
              <Text style={styles.primaryButtonText}>{t('onboarding.notif.enable')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={() => complete(false)}
            >
              <Text style={[styles.secondaryButtonText, isDark && styles.textMuted]}>
                {t('onboarding.notif.skip')}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      {/* Page dots */}
      <View style={styles.dots}>
        <View style={[styles.dot, page === 0 && styles.dotActive]} />
        <View style={[styles.dot, page === 1 && styles.dotActive]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 200,
    justifyContent: 'center',
  },
  containerDark: {
    backgroundColor: '#111',
  },
  overflow: {
    flex: 1,
    overflow: 'hidden',
  },
  pagesRow: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * 2,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#f87171',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#999',
  },
  pressed: {
    opacity: 0.75,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 48,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  dotActive: {
    backgroundColor: '#f87171',
    width: 18,
  },
  textDark: {
    color: '#eee',
  },
  textMuted: {
    color: '#999',
  },
})
