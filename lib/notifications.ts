import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PollenLevel } from '@/lib/weather-utils'

// Evening (기존 키 유지 — 기존 유저 설정 보존)
export const NOTIF_ENABLED_KEY = 'notif_enabled'
export const NOTIF_HOUR_KEY = 'notif_hour'
export const NOTIF_MINUTE_KEY = 'notif_minute'

// Morning (신규)
export const NOTIF_MORNING_ENABLED_KEY = 'notif_morning_enabled'
export const NOTIF_MORNING_HOUR_KEY = 'notif_morning_hour'
export const NOTIF_MORNING_MINUTE_KEY = 'notif_morning_minute'

export const DEFAULT_EVENING_HOUR = 21
export const DEFAULT_EVENING_MINUTE = 0
export const DEFAULT_MORNING_HOUR = 7
export const DEFAULT_MORNING_MINUTE = 0

// 하위호환
export const DEFAULT_NOTIF_HOUR = DEFAULT_EVENING_HOUR
export const MIN_NOTIF_HOUR = 17
export const MAX_NOTIF_HOUR = 23

// IDs 저장 키 (JSON 배열, 복수 알림)
const NOTIF_IDS_KEY = 'notif_alert_ids'
const NOTIF_MORNING_IDS_KEY = 'notif_morning_alert_ids'
// 마이그레이션용 구버전 키
const NOTIF_ID_LEGACY_KEY = 'notif_alert_id'
const NOTIF_MORNING_ID_LEGACY_KEY = 'notif_morning_alert_id'

export type TomorrowData = {
  pollenLevel: PollenLevel
  pollenUnknown: boolean
  icon: string
  high: number
  low: number
  needsUmbrella: boolean
}

export type TodayData = TomorrowData

const EVENING_TITLES: Record<string, (level: PollenLevel, unknown: boolean) => string> = {
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

const MORNING_TITLES: Record<string, (level: PollenLevel, unknown: boolean) => string> = {
  ko: (level, unknown) => {
    if (unknown) return '오늘의 날씨 🌤️'
    if (level <= 2) return '오늘 꽃가루 적어요 ✨'
    if (level === 3) return '오늘 꽃가루 많아요 🌿'
    return '오늘 꽃가루 주의! ⚠️'
  },
  ja: (level, unknown) => {
    if (unknown) return '今日の天気 🌤️'
    if (level <= 2) return '今日の花粉は少なめです ✨'
    if (level === 3) return '今日の花粉が多めです 🌿'
    return '今日の花粉に注意！⚠️'
  },
  en: (level, unknown) => {
    if (unknown) return "Today's weather 🌤️"
    if (level <= 2) return 'Low pollen today ✨'
    if (level === 3) return 'High pollen today 🌿'
    return 'Pollen alert today ⚠️'
  },
}

const FALLBACK_TITLES: Record<string, string> = {
  ko: '오늘 날씨 확인해보세요! 🌿',
  ja: '今日の天気をご確認ください 🌿',
  en: "Check today's weather! 🌿",
}

const FALLBACK_BODIES: Record<string, string> = {
  ko: '앱을 열어서 오늘의 꽃가루와 날씨를 확인하세요.',
  ja: 'アプリを開いて今日の花粉・天気を確認しましょう。',
  en: 'Open the app to check today\'s pollen and weather.',
}

const BODIES: Record<string, (d: TomorrowData) => string> = {
  ko: (d) => `${d.icon} 최고 ${d.high}° / 최저 ${d.low}°${d.needsUmbrella ? ' · ☂️ 우산 챙기세요!' : '.'}`,
  ja: (d) => `${d.icon} 最高 ${d.high}° / 最低 ${d.low}°${d.needsUmbrella ? ' · ☂️ 傘をお忘れなく！' : '。'}`,
  en: (d) => `${d.icon} High ${d.high}° / Low ${d.low}°${d.needsUmbrella ? ' · ☂️ Bring an umbrella!' : '.'}`,
}

function getLang(language: string): string {
  return language.startsWith('ko') ? 'ko' : language.startsWith('ja') ? 'ja' : 'en'
}

function buildContent(data: TomorrowData, language: string, titles: typeof EVENING_TITLES) {
  const lang = getLang(language)
  const title = (titles[lang] ?? titles.en)(data.pollenLevel, data.pollenUnknown)
  const body = (BODIES[lang] ?? BODIES.en)(data)
  return { title, body }
}

function dateAt(hour: number, minute: number, daysFromNow: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, minute, 0, 0)
  return d
}

function startOffset(hour: number, minute: number): number {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  return now < target ? 0 : 1
}

async function cancelStoredNotifs(idsKey: string, legacyKey: string): Promise<void> {
  const legacyId = await AsyncStorage.getItem(legacyKey)
  if (legacyId) {
    await Notifications.cancelScheduledNotificationAsync(legacyId).catch(() => {})
    await AsyncStorage.removeItem(legacyKey)
  }
  const raw = await AsyncStorage.getItem(idsKey)
  if (!raw) return
  const ids: string[] = JSON.parse(raw)
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})))
  await AsyncStorage.removeItem(idsKey)
}

async function scheduleAlerts(
  idsKey: string,
  legacyKey: string,
  data: TomorrowData | null,
  hour: number,
  minute: number,
  language: string,
  titles: typeof EVENING_TITLES,
): Promise<void> {
  await cancelStoredNotifs(idsKey, legacyKey)
  const lang = getLang(language)
  const ids: string[] = []
  const offset = startOffset(hour, minute)
  const fallbackTitle = FALLBACK_TITLES[lang] ?? FALLBACK_TITLES.en
  const fallbackBody = FALLBACK_BODIES[lang] ?? FALLBACK_BODIES.en

  // 데이터 있으면 실데이터, 없으면 바로 fallback
  const firstContent = data
    ? buildContent(data, language, titles)
    : { title: fallbackTitle, body: fallbackBody }

  ids.push(
    await Notifications.scheduleNotificationAsync({
      content: { ...firstContent, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dateAt(hour, minute, offset) },
    })
  )

  // 그 다음날부터 6일간 fallback
  for (let i = offset + 1; i <= offset + 6; i++) {
    ids.push(
      await Notifications.scheduleNotificationAsync({
        content: { title: fallbackTitle, body: fallbackBody, sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dateAt(hour, minute, i) },
      })
    )
  }

  await AsyncStorage.setItem(idsKey, JSON.stringify(ids))
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

export async function schedulePollenAlert(
  tomorrow: TomorrowData | null,
  hour: number,
  language: string,
  minute = 0,
): Promise<void> {
  await scheduleAlerts(NOTIF_IDS_KEY, NOTIF_ID_LEGACY_KEY, tomorrow, hour, minute, language, EVENING_TITLES)
}

export async function scheduleMorningAlert(
  today: TodayData | null,
  hour: number,
  minute: number,
  language: string,
): Promise<void> {
  await scheduleAlerts(NOTIF_MORNING_IDS_KEY, NOTIF_MORNING_ID_LEGACY_KEY, today, hour, minute, language, MORNING_TITLES)
}

export async function cancelPollenAlert(): Promise<void> {
  await cancelStoredNotifs(NOTIF_IDS_KEY, NOTIF_ID_LEGACY_KEY)
}

export async function cancelMorningAlert(): Promise<void> {
  await cancelStoredNotifs(NOTIF_MORNING_IDS_KEY, NOTIF_MORNING_ID_LEGACY_KEY)
}

export async function sendTestNotification(
  tomorrow: TomorrowData,
  language: string,
): Promise<void> {
  const { title, body } = buildContent(tomorrow, language, EVENING_TITLES)
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  })
}

// 테스트 전용: 실데이터 알람(30초 후) + fallback 알람(60초 후) 스케줄
export async function sendFallbackTest(
  data: TomorrowData,
  language: string,
  titles: typeof EVENING_TITLES = EVENING_TITLES,
): Promise<void> {
  const lang = getLang(language)
  const { title, body } = buildContent(data, language, titles)

  // 30초 후 - 실데이터
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 30 },
  })

  // 60초 후 - fallback
  await Notifications.scheduleNotificationAsync({
    content: {
      title: FALLBACK_TITLES[lang] ?? FALLBACK_TITLES.en,
      body: FALLBACK_BODIES[lang] ?? FALLBACK_BODIES.en,
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60 },
  })
}
