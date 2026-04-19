import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PollenLevel } from '@/lib/weather-utils'

// Evening (기존 키 유지 — 기존 유저 설정 보존)
export const NOTIF_ENABLED_KEY = 'notif_enabled'
export const NOTIF_HOUR_KEY = 'notif_hour'
export const NOTIF_MINUTE_KEY = 'notif_minute'
export const NOTIF_ID_KEY = 'notif_alert_id'

// Morning (신규)
export const NOTIF_MORNING_ENABLED_KEY = 'notif_morning_enabled'
export const NOTIF_MORNING_HOUR_KEY = 'notif_morning_hour'
export const NOTIF_MORNING_MINUTE_KEY = 'notif_morning_minute'
export const NOTIF_MORNING_ID_KEY = 'notif_morning_alert_id'

export const DEFAULT_EVENING_HOUR = 21
export const DEFAULT_EVENING_MINUTE = 0
export const DEFAULT_MORNING_HOUR = 7
export const DEFAULT_MORNING_MINUTE = 0

// 하위호환
export const DEFAULT_NOTIF_HOUR = DEFAULT_EVENING_HOUR
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

export type NotifSlotSettings = {
  enabled: boolean
  hour: number
  minute: number
}

export async function getNotificationSettings(): Promise<{
  evening: NotifSlotSettings
  morning: NotifSlotSettings
}> {
  const [
    eveningEnabled, eveningHour, eveningMinute,
    morningEnabled, morningHour, morningMinute,
  ] = await Promise.all([
    AsyncStorage.getItem(NOTIF_ENABLED_KEY),
    AsyncStorage.getItem(NOTIF_HOUR_KEY),
    AsyncStorage.getItem(NOTIF_MINUTE_KEY),
    AsyncStorage.getItem(NOTIF_MORNING_ENABLED_KEY),
    AsyncStorage.getItem(NOTIF_MORNING_HOUR_KEY),
    AsyncStorage.getItem(NOTIF_MORNING_MINUTE_KEY),
  ])
  return {
    evening: {
      enabled: eveningEnabled === 'true',
      hour: eveningHour ? parseInt(eveningHour, 10) : DEFAULT_EVENING_HOUR,
      minute: eveningMinute ? parseInt(eveningMinute, 10) : DEFAULT_EVENING_MINUTE,
    },
    morning: {
      enabled: morningEnabled === 'true',
      hour: morningHour ? parseInt(morningHour, 10) : DEFAULT_MORNING_HOUR,
      minute: morningMinute ? parseInt(morningMinute, 10) : DEFAULT_MORNING_MINUTE,
    },
  }
}

async function scheduleNotif(
  idKey: string,
  tomorrow: TomorrowData,
  hour: number,
  minute: number,
  language: string,
): Promise<void> {
  const existingId = await AsyncStorage.getItem(idKey)
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {})
  }
  const { title, body } = buildContent(tomorrow, language)
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })
  await AsyncStorage.setItem(idKey, id)
}

async function cancelNotif(idKey: string): Promise<void> {
  const id = await AsyncStorage.getItem(idKey)
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    await AsyncStorage.removeItem(idKey)
  }
}

export async function schedulePollenAlert(
  tomorrow: TomorrowData,
  hour: number,
  language: string,
  minute = 0,
): Promise<void> {
  await scheduleNotif(NOTIF_ID_KEY, tomorrow, hour, minute, language)
}

export async function scheduleMorningAlert(
  tomorrow: TomorrowData,
  hour: number,
  minute: number,
  language: string,
): Promise<void> {
  await scheduleNotif(NOTIF_MORNING_ID_KEY, tomorrow, hour, minute, language)
}

export async function cancelPollenAlert(): Promise<void> {
  await cancelNotif(NOTIF_ID_KEY)
}

export async function cancelMorningAlert(): Promise<void> {
  await cancelNotif(NOTIF_MORNING_ID_KEY)
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
