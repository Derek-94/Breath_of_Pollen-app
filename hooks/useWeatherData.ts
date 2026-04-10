import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { usePostHog } from 'posthog-react-native'
import { fetchWeather, fetchPollen, fetchPollenKR, fetchLocation, fetchAirQuality, fetchYesterdayHighTemp } from '@/lib/api'
import { findNearestKRRegion } from '@/lib/korea-coords'
import {
  getWeatherInfo,
  mapPollenIndex,
  detectCountry,
  getOutfitRecommendation,
  getDayIndex,
  formatDate,
  needsUmbrellaToday,
  POLLEN_LABEL_KEYS,
  type WeatherType,
  type PollenLevel,
  type OutfitItem,
  type OutfitSummary,
} from '@/lib/weather-utils'

type PlantInfo = { code: string; indexInfo?: { value?: number } }

function findPlantLevel(plantInfo: PlantInfo[], code: string): PollenLevel {
  const plant = plantInfo.find((p) => p.code === code)
  return mapPollenIndex(plant?.indexInfo?.value)
}

function findOverallPollenLevel(plantInfo: PlantInfo[]): PollenLevel {
  const cedar = findPlantLevel(plantInfo, 'JAPANESE_CEDAR')
  const cypress = findPlantLevel(plantInfo, 'JAPANESE_CYPRESS')
  return (Math.max(cedar, cypress) as PollenLevel) || 1
}

export interface AppData {
  location: string
  country: 'JP' | 'KR' | 'OTHER'
  temperature: number
  high: number
  low: number
  weatherType: WeatherType
  /** i18n key, e.g. 'weather.sunny' */
  descriptionKey: string
  weatherCode: number
  /** 오늘 daily weathercode 기준 우산/우의 필요 여부 */
  needsUmbrella: boolean
  humidity: number
  uvIndex: number
  /** 꽃가루 식물 목록. JP: [cedar, cypress], KR: [pine, oak, weeds] */
  pollenPlants: { typeKey: string; level: PollenLevel; labelKey: string }[]
  pollenOverall: PollenLevel
  pm2_5: number | null
  yesterdayComparison: { tempDiff: number; pollenDiff: number | null } | null
  outfitItems: OutfitItem[]
  outfitSummary: OutfitSummary
  /** hour is a number (0–23); translate with t('hourly.hourFormat', { h }) */
  hourlyData: { hour: number; temp: number; icon: string }[]
  weeklyForecast: {
    /** 0=Sun … 6=Sat */
    dayIndex: number
    date: string
    icon: string
    high: number
    low: number
    pollenLevel: PollenLevel
    /** true = 데이터 없음 (KR 4~7일차) — 회색 표시 */
    pollenUnknown: boolean
  }[]
}

export function useWeatherData(lat: number | null, lon: number | null, locationName?: string) {
  const posthog = usePostHog()
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollenUnavailable, setPollenUnavailable] = useState(false)

  const fetchData = useCallback(async () => {
    if (lat == null || lon == null) return

    setLoading(true)
    setError(null)
    setPollenUnavailable(false)

    try {
      const country = detectCountry(lat, lon)

      const pollenPromise =
        country === 'JP'
          ? fetchPollen(lat, lon)
          : country === 'KR'
            ? fetchPollenKR(lat, lon)
            : Promise.resolve(null)

      // KR: location API가 일본어 geocoding 결과를 반환하므로 직접 최근접 지역명 사용
      const locationPromise = locationName
        ? Promise.resolve(locationName)
        : country === 'KR'
          ? Promise.resolve(findNearestKRRegion(lat, lon))
          : fetchLocation(lat, lon)

      const [weather, pollenRaw, resolvedLocation, airQuality] = await Promise.all([
        fetchWeather(lat, lon),
        pollenPromise,
        locationPromise,
        fetchAirQuality(lat, lon),
      ])

      // Current conditions
      const currentTemp = Math.round(weather.current.temperature_2m)
      const currentCode: number = weather.current.weathercode
      const currentHumidity = Math.round(weather.current.relative_humidity_2m)
      const currentUV = Math.round(weather.current.uv_index ?? 0)
      const todayHigh = Math.round(weather.daily.temperature_2m_max[0])
      const todayLow = Math.round(weather.daily.temperature_2m_min[0])
      const dailyCode: number = weather.daily.weathercode[0]
      const weatherInfo = getWeatherInfo(currentCode)

      // Pollen
      let pollenPlants: AppData['pollenPlants'] = []
      let overallLevel: PollenLevel = 1
      let weeklyPollenLevels: PollenLevel[] = []  // 일별 꽃가루 레벨 (JP: 7일, KR: 4일)

      if (country === 'JP' && pollenRaw) {
        const pollen = pollenRaw as Awaited<ReturnType<typeof fetchPollen>>
        const todayPlants: PlantInfo[] = pollen.dailyInfo?.[0]?.plantInfo ?? []
        const cedarLevel = findPlantLevel(todayPlants, 'JAPANESE_CEDAR')
        const cypressLevel = findPlantLevel(todayPlants, 'JAPANESE_CYPRESS')
        overallLevel = (Math.max(cedarLevel, cypressLevel) as PollenLevel) || 1
        pollenPlants = [
          { typeKey: 'plant.cedar', level: cedarLevel, labelKey: POLLEN_LABEL_KEYS[cedarLevel] },
          { typeKey: 'plant.cypress', level: cypressLevel, labelKey: POLLEN_LABEL_KEYS[cypressLevel] },
        ]
        weeklyPollenLevels = (weather.daily.time as string[]).map((_: string, i: number) => {
          const dayPlants: PlantInfo[] = pollen.dailyInfo?.[i]?.plantInfo ?? []
          return findOverallPollenLevel(dayPlants)
        })
      } else if (country === 'KR' && pollenRaw) {
        const krPollen = pollenRaw as Awaited<ReturnType<typeof fetchPollenKR>>
        if (krPollen) {
          overallLevel = krPollen.dailyOverall[0] || 1
          pollenPlants = krPollen.plants.map((p) => ({
            typeKey: p.typeKey,
            level: p.days[0],
            labelKey: POLLEN_LABEL_KEYS[p.days[0]],
          }))
          weeklyPollenLevels = (weather.daily.time as string[]).map((_: string, i: number) =>
            krPollen.dailyOverall[i] ?? 1
          )
        }
      } else {
        // JP도 KR도 아님
        setPollenUnavailable(true)
      }

      // PM2.5 — current hour value
      let pm2_5: number | null = null
      if (airQuality?.hourly?.pm2_5) {
        const nowHour = new Date().getHours()
        const todayDateStr = new Date().toISOString().slice(0, 10)
        const aqTimes: string[] = airQuality.hourly.time ?? []
        const aqIdx = aqTimes.findIndex((t: string) => t === `${todayDateStr}T${String(nowHour).padStart(2, '0')}:00`)
        const raw = aqIdx >= 0 ? airQuality.hourly.pm2_5[aqIdx] : airQuality.hourly.pm2_5[0]
        pm2_5 = raw != null ? Math.round(raw) : null
      }

      // Outfit
      const { items: outfitItems, summary: outfitSummary } = getOutfitRecommendation(currentTemp, overallLevel)

      // Hourly chart (current hour + next 7 hours)
      const now = new Date()
      const currentHour = now.getHours()
      const todayStr = now.toISOString().slice(0, 10)
      const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().slice(0, 10)

      // Yesterday comparison
      const SNAPSHOT_KEY = 'daily_snapshot'
      let yesterdayComparison: AppData['yesterdayComparison'] = null
      try {
        const raw = await AsyncStorage.getItem(SNAPSHOT_KEY)
        let yesterdayHigh: number | null = null
        let yesterdayPollenLevel: PollenLevel | null = null

        if (raw) {
          const snapshot: { date: string; high: number; pollenLevel: PollenLevel } = JSON.parse(raw)
          if (snapshot.date === yesterdayStr) {
            yesterdayHigh = snapshot.high
            yesterdayPollenLevel = snapshot.pollenLevel
          }
        }

        // 캐시 없으면 Open-Meteo에서 직접 가져오기
        if (yesterdayHigh === null) {
          yesterdayHigh = await fetchYesterdayHighTemp(lat, lon)
        }

        if (yesterdayHigh !== null) {
          yesterdayComparison = {
            tempDiff: todayHigh - yesterdayHigh,
            pollenDiff: yesterdayPollenLevel !== null ? overallLevel - yesterdayPollenLevel : null,
          }
        }

        await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ date: todayStr, high: todayHigh, pollenLevel: overallLevel }))
      } catch { /* non-fatal */ }
      const hourlyTimes: string[] = weather.hourly.time
      const startIdx = hourlyTimes.findIndex(
        (t: string) => t === `${todayStr}T${String(currentHour).padStart(2, '0')}:00`
      )
      const hourlyData = Array.from({ length: 8 }, (_, i) => {
        const idx = startIdx + i
        const timeStr: string = hourlyTimes[idx] ?? ''
        const h = parseInt(timeStr.slice(11, 13))
        return {
          hour: h,
          temp: Math.round(weather.hourly.temperature_2m[idx] ?? currentTemp),
          icon: getWeatherInfo(weather.hourly.weathercode[idx] ?? 0).emoji,
        }
      })

      // Weekly forecast
      // KR은 KMA가 3일치만 제공 → 그 이후 인덱스는 pollenUnknown=true (비시즌 제외)
      const isKRSeason = country === 'KR' && pollenPlants.length > 0
      const krPollenDays = isKRSeason ? 3 : undefined
      const weeklyForecast = (weather.daily.time as string[]).map((dateStr: string, i: number) => ({
        dayIndex: getDayIndex(dateStr),
        date: formatDate(dateStr),
        icon: getWeatherInfo(weather.daily.weathercode[i]).emoji,
        high: Math.round(weather.daily.temperature_2m_max[i]),
        low: Math.round(weather.daily.temperature_2m_min[i]),
        pollenLevel: weeklyPollenLevels[i] ?? 1,
        pollenUnknown: krPollenDays !== undefined && i >= krPollenDays,
      }))

      setData({
        location: resolvedLocation,
        country,
        temperature: currentTemp,
        high: todayHigh,
        low: todayLow,
        weatherType: weatherInfo.type,
        descriptionKey: weatherInfo.descriptionKey,
        weatherCode: currentCode,
        needsUmbrella: needsUmbrellaToday(dailyCode),
        humidity: currentHumidity,
        uvIndex: currentUV,
        pollenPlants,
        pollenOverall: overallLevel,
        pm2_5,
        yesterdayComparison,
        outfitItems,
        outfitSummary,
        hourlyData,
        weeklyForecast,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'common.error'
      setError(msg)
      posthog.capture('data_fetch_error', { error: msg, lat, lon })
    } finally {
      setLoading(false)
    }
  }, [lat, lon, locationName, posthog])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, pollenUnavailable, refetch: fetchData }
}
