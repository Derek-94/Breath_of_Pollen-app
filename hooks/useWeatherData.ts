import { useState, useEffect, useCallback } from 'react'
import { fetchWeather, fetchPollen, fetchLocation } from '@/lib/api'
import {
  getWeatherInfo,
  mapPollenIndex,
  getOutfitRecommendation,
  getJapaneseDayOfWeek,
  formatDate,
  type WeatherType,
  type PollenLevel,
  type OutfitItem,
  POLLEN_LABELS,
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
  temperature: number
  high: number
  low: number
  weatherType: WeatherType
  description: string
  weatherCode: number
  humidity: number
  uvIndex: number
  pollenCedar: { type: string; level: PollenLevel; label: string }
  pollenCypress: { type: string; level: PollenLevel; label: string }
  pollenOverall: PollenLevel
  outfitItems: OutfitItem[]
  outfitSummary: string
  hourlyData: { hour: string; temp: number; icon: string }[]
  weeklyForecast: {
    day: string
    date: string
    icon: string
    high: number
    low: number
    pollenLevel: PollenLevel
  }[]
}

export function useWeatherData(lat: number | null, lon: number | null, locationName?: string) {
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
      const [weather, pollen, resolvedLocation] = await Promise.all([
        fetchWeather(lat, lon),
        fetchPollen(lat, lon),
        locationName ? Promise.resolve(locationName) : fetchLocation(lat, lon),
      ])

      // Current conditions
      const currentTemp = Math.round(weather.current.temperature_2m)
      const currentCode: number = weather.current.weathercode
      const currentHumidity = Math.round(weather.current.relative_humidity_2m)
      const currentUV = Math.round(weather.current.uv_index ?? 0)
      const todayHigh = Math.round(weather.daily.temperature_2m_max[0])
      const todayLow = Math.round(weather.daily.temperature_2m_min[0])
      const weatherInfo = getWeatherInfo(currentCode)

      // Pollen
      if (pollen.regionCode !== 'JP') {
        setPollenUnavailable(true)
      }
      const todayPlants: PlantInfo[] = pollen.dailyInfo?.[0]?.plantInfo ?? []
      const cedarLevel = findPlantLevel(todayPlants, 'JAPANESE_CEDAR')
      const cypressLevel = findPlantLevel(todayPlants, 'JAPANESE_CYPRESS')
      const overallLevel: PollenLevel = (Math.max(cedarLevel, cypressLevel) as PollenLevel) || 1

      // Outfit
      const { items: outfitItems, summary: outfitSummary } = getOutfitRecommendation(currentTemp, overallLevel)

      // Hourly chart (current hour + next 7 hours)
      const now = new Date()
      const currentHour = now.getHours()
      const todayStr = now.toISOString().slice(0, 10)
      const hourlyTimes: string[] = weather.hourly.time
      const startIdx = hourlyTimes.findIndex(
        (t: string) => t === `${todayStr}T${String(currentHour).padStart(2, '0')}:00`
      )
      const hourlyData = Array.from({ length: 8 }, (_, i) => {
        const idx = startIdx + i
        const timeStr: string = hourlyTimes[idx] ?? ''
        const h = parseInt(timeStr.slice(11, 13))
        return {
          hour: `${h}時`,
          temp: Math.round(weather.hourly.temperature_2m[idx] ?? currentTemp),
          icon: getWeatherInfo(weather.hourly.weathercode[idx] ?? 0).emoji,
        }
      })

      // Weekly forecast
      const weeklyForecast = (weather.daily.time as string[]).map((dateStr: string, i: number) => {
        const weeklyPlants: PlantInfo[] = pollen.dailyInfo?.[i]?.plantInfo ?? []
        return {
          day: getJapaneseDayOfWeek(dateStr),
          date: formatDate(dateStr),
          icon: getWeatherInfo(weather.daily.weathercode[i]).emoji,
          high: Math.round(weather.daily.temperature_2m_max[i]),
          low: Math.round(weather.daily.temperature_2m_min[i]),
          pollenLevel: findOverallPollenLevel(weeklyPlants),
        }
      })

      setData({
        location: resolvedLocation,
        temperature: currentTemp,
        high: todayHigh,
        low: todayLow,
        weatherType: weatherInfo.type,
        description: weatherInfo.description,
        weatherCode: currentCode,
        humidity: currentHumidity,
        uvIndex: currentUV,
        pollenCedar: { type: 'スギ', level: cedarLevel, label: POLLEN_LABELS[cedarLevel] },
        pollenCypress: { type: 'ヒノキ', level: cypressLevel, label: POLLEN_LABELS[cypressLevel] },
        pollenOverall: overallLevel,
        outfitItems,
        outfitSummary,
        hourlyData,
        weeklyForecast,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [lat, lon, locationName])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, pollenUnavailable, refetch: fetchData }
}
