import { useState, useCallback, useEffect, useRef } from 'react'
import { usePostHog } from 'posthog-react-native'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from 'expo-router'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Linking,
  Modal,
} from 'react-native'
import { TimePicker } from '@/components/TimePicker'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { useLocationContext } from '@/contexts/LocationContext'
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext'
import { useWeatherDataContext } from '@/contexts/WeatherDataContext'
import { LocationPicker } from '@/components/LocationPicker'
import {
  changeLanguage,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/lib/i18n'
import { localizeLocationName } from '@/lib/prefecture-i18n'
import {
  requestNotificationPermission,
  schedulePollenAlert,
  cancelPollenAlert,
  scheduleMorningAlert,
  cancelMorningAlert,
  getNotificationSettings,
  NOTIF_ENABLED_KEY,
  NOTIF_HOUR_KEY,
  NOTIF_MINUTE_KEY,
  NOTIF_MORNING_ENABLED_KEY,
  NOTIF_MORNING_HOUR_KEY,
  NOTIF_MORNING_MINUTE_KEY,
  DEFAULT_EVENING_HOUR,
  DEFAULT_EVENING_MINUTE,
  DEFAULT_MORNING_HOUR,
  DEFAULT_MORNING_MINUTE,
} from '@/lib/notifications'

const THEME_OPTIONS: { value: ThemeMode; labelKey: string }[] = [
  { value: 'system', labelKey: 'settings.themeSystem' },
  { value: 'light', labelKey: 'settings.themeLight' },
  { value: 'dark', labelKey: 'settings.themeDark' },
]

export default function SettingsScreen() {
  const { isDark, themeMode, setThemeMode } = useTheme()
  const posthog = usePostHog()
  const { t, i18n } = useTranslation()
  const { location, setManualLocation, clearSavedLocation } = useLocationContext()
  const { data } = useWeatherDataContext()
  const [showPicker, setShowPicker] = useState(false)

  const [eveningEnabled, setEveningEnabled] = useState(false)
  const [eveningHour, setEveningHour] = useState(DEFAULT_EVENING_HOUR)
  const [eveningMinute, setEveningMinute] = useState(DEFAULT_EVENING_MINUTE)

  const [morningEnabled, setMorningEnabled] = useState(false)
  const [morningHour, setMorningHour] = useState(DEFAULT_MORNING_HOUR)
  const [morningMinute, setMorningMinute] = useState(DEFAULT_MORNING_MINUTE)

  const [timeModalSlot, setTimeModalSlot] = useState<'evening' | 'morning' | null>(null)
  const [modalHour, setModalHour] = useState(0)
  const [modalMinute, setModalMinute] = useState(0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getNotificationSettings().then(({ evening, morning }) => {
      setEveningEnabled(evening.enabled)
      setEveningHour(evening.hour)
      setEveningMinute(evening.minute)
      setMorningEnabled(morning.enabled)
      setMorningHour(morning.hour)
      setMorningMinute(morning.minute)
    })
  }, [])

  const getTomorrowData = useCallback(() => {
    const tomorrow = data?.weeklyForecast[1]
    if (!tomorrow) return null
    return {
      pollenLevel: tomorrow.pollenLevel,
      pollenUnknown: tomorrow.pollenUnknown,
      icon: tomorrow.icon,
      high: tomorrow.high,
      low: tomorrow.low,
      needsUmbrella: tomorrow.needsUmbrella,
    }
  }, [data])

  const handleEveningToggle = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        Alert.alert(t('settings.notifPermissionDenied'))
        return
      }
      await AsyncStorage.setItem(NOTIF_ENABLED_KEY, 'true')
      setEveningEnabled(true)
      const tomorrow = getTomorrowData()
      if (tomorrow) {
        await schedulePollenAlert(tomorrow, eveningHour, i18n.language, eveningMinute)
      }
    } else {
      await AsyncStorage.setItem(NOTIF_ENABLED_KEY, 'false')
      await cancelPollenAlert()
      setEveningEnabled(false)
    }
  }, [eveningHour, eveningMinute, i18n.language, t, getTomorrowData])

  const handleMorningToggle = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        Alert.alert(t('settings.notifPermissionDenied'))
        return
      }
      await AsyncStorage.setItem(NOTIF_MORNING_ENABLED_KEY, 'true')
      setMorningEnabled(true)
      const tomorrow = getTomorrowData()
      if (tomorrow) {
        await scheduleMorningAlert(tomorrow, morningHour, morningMinute, i18n.language)
      }
    } else {
      await AsyncStorage.setItem(NOTIF_MORNING_ENABLED_KEY, 'false')
      await cancelMorningAlert()
      setMorningEnabled(false)
    }
  }, [morningHour, morningMinute, i18n.language, t, getTomorrowData])

  const openTimeModal = useCallback((slot: 'evening' | 'morning') => {
    if (slot === 'evening') {
      setModalHour(eveningHour)
      setModalMinute(eveningMinute)
    } else {
      setModalHour(morningHour)
      setModalMinute(morningMinute)
    }
    setTimeModalSlot(slot)
  }, [eveningHour, eveningMinute, morningHour, morningMinute])

  const handleTimeConfirm = useCallback(async () => {
    const slot = timeModalSlot
    if (!slot) return
    setTimeModalSlot(null)

    const h = modalHour
    const m = modalMinute
    const tomorrow = getTomorrowData()

    if (slot === 'evening') {
      setEveningHour(h)
      setEveningMinute(m)
      await Promise.all([
        AsyncStorage.setItem(NOTIF_HOUR_KEY, String(h)),
        AsyncStorage.setItem(NOTIF_MINUTE_KEY, String(m)),
      ])
      if (eveningEnabled && tomorrow) {
        await schedulePollenAlert(tomorrow, h, i18n.language, m)
      }
    } else {
      setMorningHour(h)
      setMorningMinute(m)
      await Promise.all([
        AsyncStorage.setItem(NOTIF_MORNING_HOUR_KEY, String(h)),
        AsyncStorage.setItem(NOTIF_MORNING_MINUTE_KEY, String(m)),
      ])
      if (morningEnabled && tomorrow) {
        await scheduleMorningAlert(tomorrow, h, m, i18n.language)
      }
    }
  }, [timeModalSlot, modalHour, modalMinute, eveningEnabled, morningEnabled, i18n.language, getTomorrowData])

  useFocusEffect(
    useCallback(() => {
      return () => setShowPicker(false)
    }, [])
  )

  const handlePrefectureSelect = useCallback(
    (name: string, lat: number, lon: number) => {
      setManualLocation(lat, lon, name)
      setShowPicker(false)
    },
    [setManualLocation],
  )

  const handleResetLocation = useCallback(async () => {
    await clearSavedLocation()
  }, [clearSavedLocation])

  const handleLanguageChange = useCallback(async (lang: SupportedLanguage) => {
    posthog.capture('language_changed', { language: lang })
    await changeLanguage(lang)
  }, [posthog])

  const appVersion = Constants.expoConfig?.version ?? '1.0.0'

  if (showPicker) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.pickerHeader}>
          <Pressable onPress={() => setShowPicker(false)}>
            <Text style={[styles.backText, isDark && styles.tintDark]}>{t('common.back')}</Text>
          </Pressable>
        </View>
        <LocationPicker onSelect={handlePrefectureSelect} onReset={handleResetLocation} currentLocationName={location?.name} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.header, isDark && styles.textDark]}>{t('settings.header')}</Text>

        {/* Location section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>{t('settings.location')}</Text>

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>{t('settings.currentLocation')}</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>
              {location?.name ? localizeLocationName(location.name, i18n.language) : t('common.autoDetect')}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.buttonText}>{t('settings.changeLocation')}</Text>
          </Pressable>

          {location?.name && (
            <Pressable onPress={handleResetLocation}>
              <Text style={[styles.resetText, isDark && styles.tintDark]}>
                {t('settings.resetLocation')}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Notification section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>{t('settings.notification')}</Text>

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>🌙 {t('settings.notifToggle')}</Text>
            <Switch
              value={eveningEnabled}
              onValueChange={handleEveningToggle}
              trackColor={{ false: '#ccc', true: '#f87171' }}
              thumbColor="#fff"
            />
          </View>
          {eveningEnabled && (
            <Pressable style={styles.timeRow} onPress={() => openTimeModal('evening')}>
              <Text style={[styles.timeText, isDark && styles.tintDark]}>
                {String(eveningHour).padStart(2, '0')}:{String(eveningMinute).padStart(2, '0')}
              </Text>
              <Text style={[styles.timeChevron, isDark && styles.tintDark]}>›</Text>
            </Pressable>
          )}

          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <View style={[styles.row, styles.rowLast]}>
            <Text style={[styles.label, isDark && styles.textMuted]}>🌅 {t('settings.notifMorningToggle')}</Text>
            <Switch
              value={morningEnabled}
              onValueChange={handleMorningToggle}
              trackColor={{ false: '#ccc', true: '#f87171' }}
              thumbColor="#fff"
            />
          </View>
          {morningEnabled && (
            <Pressable style={styles.timeRow} onPress={() => openTimeModal('morning')}>
              <Text style={[styles.timeText, isDark && styles.tintDark]}>
                {String(morningHour).padStart(2, '0')}:{String(morningMinute).padStart(2, '0')}
              </Text>
              <Text style={[styles.timeChevron, isDark && styles.tintDark]}>›</Text>
            </Pressable>
          )}
        </View>

        {/* Time picker modal */}
        <Modal visible={timeModalSlot !== null} transparent animationType="slide">
          <Pressable style={styles.modalBackdrop} onPress={() => setTimeModalSlot(null)} />
          <View style={[styles.modalSheet, isDark && styles.modalSheetDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>{t('settings.notifTime')}</Text>
            <TimePicker hour={modalHour} minute={modalMinute} onChange={(h, m) => { setModalHour(h); setModalMinute(m) }} />
            <Pressable
              style={({ pressed }) => [styles.modalConfirm, pressed && { opacity: 0.8 }]}
              onPress={handleTimeConfirm}
            >
              <Text style={styles.modalConfirmText}>{t('settings.notifSaved')}</Text>
            </Pressable>
          </View>
        </Modal>

        {/* Theme section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>{t('settings.theme')}</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.themeChip,
                  isDark && styles.themeChipDark,
                  themeMode === opt.value && styles.themeChipActive,
                  themeMode === opt.value && isDark && styles.themeChipActiveDark,
                ]}
                onPress={() => {
                  posthog.capture('theme_changed', { theme: opt.value })
                  setThemeMode(opt.value)
                }}
              >
                <Text style={[
                  styles.themeChipText,
                  isDark && styles.textMuted,
                  themeMode === opt.value && styles.themeChipTextActive,
                ]}>
                  {t(opt.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Language section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>{t('settings.language')}</Text>
          <View style={styles.themeRow}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                style={[
                  styles.themeChip,
                  isDark && styles.themeChipDark,
                  i18n.language === lang && styles.themeChipActive,
                  i18n.language === lang && isDark && styles.themeChipActiveDark,
                ]}
                onPress={() => handleLanguageChange(lang)}
              >
                <Text style={[
                  styles.themeChipText,
                  isDark && styles.textMuted,
                  i18n.language === lang && styles.themeChipTextActive,
                ]}>
                  {LANGUAGE_LABELS[lang]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* App info section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>{t('settings.appInfo')}</Text>

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>{t('settings.appName')}</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>花粉の呼吸</Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>{t('settings.version')}</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>v{appVersion}</Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>{t('settings.dataProvider')}</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>
              Open-Meteo / Google Pollen
            </Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>{t('settings.dataProviderKR')}</Text>
            <Pressable onPress={() => Linking.openURL('https://www.data.go.kr/data/15085289/openapi.do')}>
              <Text style={[styles.linkText, isDark && styles.tintDark]}>data.go.kr →</Text>
            </Pressable>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <Pressable
            style={styles.row}
            onPress={() => Linking.openURL('https://github.com/Derek-94/Breath_of_Pollen-app')}
          >
            <Text style={[styles.label, isDark && styles.textMuted]}>{t('settings.sourceCode')}</Text>
            <Text style={[styles.linkText, isDark && styles.tintDark]}>GitHub →</Text>
          </Pressable>
        </View>

        <Text style={[styles.footer, isDark && styles.textMuted]}>
          {t('settings.footer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  containerDark: {
    backgroundColor: '#111',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLast: {
    paddingBottom: 0,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  dividerDark: {
    backgroundColor: '#333',
  },
  button: {
    backgroundColor: '#f87171',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resetText: {
    fontSize: 13,
    color: '#f87171',
    textAlign: 'center',
    marginTop: 10,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  themeChipDark: {
    backgroundColor: '#2a2a2a',
  },
  themeChipActive: {
    backgroundColor: '#f87171',
  },
  themeChipActiveDark: {
    backgroundColor: '#fb923c',
  },
  themeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  themeChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f87171',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    paddingLeft: 2,
    gap: 4,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f87171',
  },
  timeChevron: {
    fontSize: 18,
    color: '#f87171',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalSheetDark: {
    backgroundColor: '#1e1e1e',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  modalConfirm: {
    backgroundColor: '#f87171',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  tintDark: {
    color: '#fb923c',
  },
  footer: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 20,
  },
  textDark: {
    color: '#eee',
  },
  textMuted: {
    color: '#999',
  },
  pickerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#f87171',
  },
})
