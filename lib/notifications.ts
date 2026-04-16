import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PollenLevel } from '@/lib/weather-utils'

export const NOTIF_ENABLED_KEY = 'notif_enabled'
export const NOTIF_HOUR_KEY = 'notif_hour'
export const NOTIF_ID_KEY = 'notif_alert_id'
export const DEFAULT_NOTIF_HOUR = 21
export const MIN_NOTIF_HOUR = 17
export const MAX_NOTIF_HOUR = 23

export type TomorrowData = {
  pollenLevel: PollenLevel
  pollenUnknown: boolean
  icon: string
  high: number
  low: number
  needsUmbrella: boolean
}

const TITLES: Record<string, (level: PollenLevel, unknown: boolean) => string> = {
  ko: (level, unknown) => {
    if (unknown) return '내일의 날씨 예보 🌤️'
    if (level <= 2) return '내일 꽃가루 적어요 ✨'
    if (level === 3) return '내일 꽃가루 많아요 🌿'
    return '내일 꽃가루 주의! ⚠️'
  },
  ja: (level, unknown) => {
    if (unknown) return '明日の天気予報 🌤️'
    if (level <= 2) return '明日の花粉は少なめです ✨'
    if (level === 3) return '明日の花粉が多めです 🌿'
    return '明日の花粉に注意！⚠️'
  },
  en: (level, unknown) => {
    if (unknown) return "Tomorrow's forecast 🌤️"
    if (level <= 2) return 'Low pollen tomorrow ✨'
    if (level === 3) return 'High pollen tomorrow 🌿'
    return 'Pollen alert tomorrow ⚠️'
  },
}

const BODIES: Record<string, (d: TomorrowData) => string> = {
  ko: (d) => `${d.icon} 최고 ${d.high}° / 최저 ${d.low}°${d.needsUmbrella ? ' · ☂️ 우산 챙기세요!' : '.'}`,
  ja: (d) => `${d.icon} 最高 ${d.high}° / 最低 ${d.low}°${d.needsUmbrella ? ' · ☂️ 傘をお忘れなく！' : '。'}`,
  en: (d) => `${d.icon} High ${d.high}° / Low ${d.low}°${d.needsUmbrella ? ' · ☂️ Bring an umbrella!' : '.'}`,
}

function buildContent(tomorrow: TomorrowData, language: string) {
  const lang = language.startsWith('ko') ? 'ko' : language.startsWith('ja') ? 'ja' : 'en'
  const title = (TITLES[lang] ?? TITLES.en)(tomorrow.pollenLevel, tomorrow.pollenUnknown)
  const body = (BODIES[lang] ?? BODIES.en)(tomorrow)
  return { title, body }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  })
  return status === 'granted'
}

export async function getNotificationSettings(): Promise<{ enabled: boolean; hour: number }> {
  const [enabled, hour] = await Promise.all([
    AsyncStorage.getItem(NOTIF_ENABLED_KEY),
    AsyncStorage.getItem(NOTIF_HOUR_KEY),
  ])
  return {
    enabled: enabled === 'true',
    hour: hour ? parseInt(hour, 10) : DEFAULT_NOTIF_HOUR,
  }
}

export async function schedulePollenAlert(
  tomorrow: TomorrowData,
  hour: number,
  language: string,
): Promise<void> {
  await cancelPollenAlert()
  const { title, body } = buildContent(tomorrow, language)
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  })
  await AsyncStorage.setItem(NOTIF_ID_KEY, id)
}

export async function cancelPollenAlert(): Promise<void> {
  const id = await AsyncStorage.getItem(NOTIF_ID_KEY)
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    await AsyncStorage.removeItem(NOTIF_ID_KEY)
  }
}

export async function sendTestNotification(
  tomorrow: TomorrowData,
  language: string,
): Promise<void> {
  const { title, body } = buildContent(tomorrow, language)
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  })
}
