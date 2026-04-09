import AsyncStorage from '@react-native-async-storage/async-storage'

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
    throw new Error('天気データの取得に失敗しました')
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
    throw new Error('花粉データの取得に失敗しました')
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
