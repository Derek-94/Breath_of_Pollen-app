import AsyncStorage from '@react-native-async-storage/async-storage'
import { mapKMAGrade, type PollenLevel } from '@/lib/weather-utils'
import { findNearestKRSigungu, KOREA_SIGUNGU, KOREA_SIDO } from '@/lib/korea-coords'
import i18n from '@/lib/i18n'

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://breath-of-pollen.vercel.app'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const FETCH_TIMEOUT = 10_000 // 10 seconds

interface CacheEntry<T> {
  data: T
  timestamp: number
}

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      await AsyncStorage.removeItem(key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() }
    await AsyncStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Cache write failure is non-fatal
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchWeather(lat: number, lon: number) {
  const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/weather?lat=${lat}&lon=${lon}`)
    const data = await res.json()
    await setCache(cacheKey, data)
    return data
  } catch {
    const cached = await getCached(cacheKey)
    if (cached) return cached
    throw new Error(i18n.t('common.error'))
  }
}

export async function fetchPollen(lat: number, lon: number) {
  const cacheKey = `pollen_${lat.toFixed(2)}_${lon.toFixed(2)}`
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/pollen?lat=${lat}&lon=${lon}`)
    const data = await res.json()
    await setCache(cacheKey, data)
    return data
  } catch {
    const cached = await getCached(cacheKey)
    if (cached) return cached
    throw new Error(i18n.t('common.error'))
  }
}

export async function fetchAirQuality(lat: number, lon: number) {
  const cacheKey = `airquality_${lat.toFixed(2)}_${lon.toFixed(2)}`
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/airquality?lat=${lat}&lon=${lon}`)
    const data = await res.json()
    await setCache(cacheKey, data)
    return data
  } catch {
    const cached = await getCached(cacheKey)
    if (cached) return cached
    return null
  }
}

export async function fetchYesterdayHighTemp(lat: number, lon: number): Promise<number | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&past_days=1&forecast_days=1&timezone=Asia%2FTokyo`
    const res = await fetchWithTimeout(url)
    const data = await res.json()
    const val = data?.daily?.temperature_2m_max?.[0]
    return val != null ? Math.round(val) : null
  } catch {
    return null
  }
}

export interface KRPollenResult {
  plants: {
    typeKey: string
    /** [오늘, 내일, 모레, 글피] */
    days: PollenLevel[]
  }[]
  /** 일별 최고 레벨 (plants 중 max) */
  dailyOverall: PollenLevel[]
}

/** 기상청 API 발표 시각: 06시, 18시 기준 → YYYYMMDDHH 문자열 반환 */
function getKMATime(): string {
  // KST = UTC+9
  const kst = new Date(Date.now() + 9 * 3600 * 1000)
  const h = kst.getUTCHours()

  let year = kst.getUTCFullYear()
  let month = kst.getUTCMonth()
  let date = kst.getUTCDate()
  let issueHour: number

  if (h >= 18) {
    // 오늘 18시 발표
    issueHour = 18
  } else if (h >= 6) {
    // 오늘 06시 발표
    issueHour = 6
  } else {
    // 자정~06시: 어제 18시 발표가 최신
    const yesterday = new Date(Date.UTC(year, month, date - 1))
    year = yesterday.getUTCFullYear()
    month = yesterday.getUTCMonth()
    date = yesterday.getUTCDate()
    issueHour = 18
  }

  return `${year}${String(month + 1).padStart(2, '0')}${String(date).padStart(2, '0')}${String(issueHour).padStart(2, '0')}`
}

function extractKMADays(res: any): PollenLevel[] {
  try {
    const item = res?.response?.body?.items?.item?.[0]
    if (!item) return [1, 1, 1]
    // today가 비어있으면(18시 발표) tomorrow부터 시작
    const raw = [item.today, item.tomorrow, item.dayaftertomorrow, item.twodaysaftertomorrow]
    const valid = raw.filter((v) => v !== '' && v != null)
    return [0, 1, 2].map((i) => mapKMAGrade(valid[i] ?? null)) as PollenLevel[]
  } catch {
    return [1, 1, 1]
  }
}

export async function fetchPollenKR(lat: number, lon: number): Promise<KRPollenResult | null> {
  const regionKey = findNearestKRSigungu(lat, lon)
  const region = KOREA_SIGUNGU[regionKey] ?? KOREA_SIDO[regionKey]
  const { areaNo } = region

  // KST 현재 월 (1-indexed)
  const kstMonth = new Date(Date.now() + 9 * 3600 * 1000).getUTCMonth() + 1

  // 비시즌: API 호출 없이 빈 결과 반환
  const isSpring = kstMonth >= 3 && kstMonth <= 6   // 소나무 + 참나무
  const isAutumn = kstMonth >= 8 && kstMonth <= 10  // 잡초류
  if (!isSpring && !isAutumn) {
    return { plants: [], dailyOverall: [1, 1, 1] }
  }

  const cacheKey = `pollen_kr_${areaNo}_${kstMonth}`
  const time = getKMATime()
  const key = process.env.EXPO_PUBLIC_KMA_API_KEY ?? ''
  const base = 'https://apis.data.go.kr/1360000/HealthWthrIdxServiceV3'
  const params = `serviceKey=${key}&areaNo=${areaNo}&time=${time}&numOfRows=10&pageNo=1&dataType=JSON`

  try {
    let plantResults: KRPollenResult['plants'] = []

    if (isSpring) {
      const [pineRes, oakRes] = await Promise.all([
        fetchWithTimeout(`${base}/getPinePollenRiskIdxV3?${params}`).then((r) => r.json()),
        fetchWithTimeout(`${base}/getOakPollenRiskIdxV3?${params}`).then((r) => r.json()),
      ])
      plantResults = [
        { typeKey: 'plant.pine', days: extractKMADays(pineRes) },
        { typeKey: 'plant.oak', days: extractKMADays(oakRes) },
      ]
    } else {
      const weedsRes = await fetchWithTimeout(`${base}/getWeedsPollenRiskndxV3?${params}`).then((r) => r.json())
      plantResults = [
        { typeKey: 'plant.weeds', days: extractKMADays(weedsRes) },
      ]
    }

    const result: KRPollenResult = {
      plants: plantResults,
      dailyOverall: [0, 1, 2].map((i) =>
        ((Math.max(...plantResults.map((p) => p.days[i])) || 1) as PollenLevel)
      ),
    }

    await setCache(cacheKey, result)
    return result
  } catch {
    const cached = await getCached<KRPollenResult>(cacheKey)
    return cached
  }
}

export async function fetchLocation(lat: number, lon: number): Promise<string> {
  const cacheKey = `location_${lat.toFixed(2)}_${lon.toFixed(2)}`
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/location?lat=${lat}&lon=${lon}`)
    const data = await res.json()
    await setCache(cacheKey, data.location)
    return data.location
  } catch {
    const cached = await getCached<string>(cacheKey)
    if (cached) return cached
    return '現在地'
  }
}
