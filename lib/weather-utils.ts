export type WeatherType = "sunny" | "cloudy" | "rainy" | "snowy" | "partly-cloudy" | "foggy"
export type PollenLevel = 1 | 2 | 3 | 4 | 5

export interface OutfitItem {
  icon: string
  /** i18n key, e.g. 'outfit.tshirt' */
  name: string
  recommended: boolean
  /** i18n key, e.g. 'outfit.sunProtection' — undefined if no reason */
  reason?: string
}

export interface OutfitSummary {
  baseKey: string
  params: { temp: number }
  maskSuffixKey?: string
}

/** i18n keys for pollen levels */
export const POLLEN_LABEL_KEYS: Record<PollenLevel, string> = {
  1: 'pollen.veryLow',
  2: 'pollen.slightlyHigh',
  3: 'pollen.high',
  4: 'pollen.veryHigh',
  5: 'pollen.extreme',
}

// WMO weather code → WeatherType + emoji + i18n description key
export function getWeatherInfo(code: number): {
  type: WeatherType
  emoji: string
  descriptionKey: string
} {
  if (code === 0) return { type: 'sunny', emoji: '☀️', descriptionKey: 'weather.sunny' }
  if (code <= 2) return { type: 'partly-cloudy', emoji: '🌤️', descriptionKey: 'weather.partlyCloudy' }
  if (code === 3) return { type: 'cloudy', emoji: '☁️', descriptionKey: 'weather.cloudy' }
  if (code <= 48) return { type: 'foggy', emoji: '🌫️', descriptionKey: 'weather.foggy' }
  if (code <= 67) return { type: 'rainy', emoji: '🌧️', descriptionKey: 'weather.rainy' }
  if (code <= 77) return { type: 'snowy', emoji: '❄️', descriptionKey: 'weather.snowy' }
  if (code <= 82) return { type: 'rainy', emoji: '🌦️', descriptionKey: 'weather.showers' }
  return { type: 'rainy', emoji: '⛈️', descriptionKey: 'weather.thunderstorm' }
}

// Google Pollen API index (0–5) → our 1–5 scale
export function mapPollenIndex(value: number | undefined | null): PollenLevel {
  if (!value || value <= 1) return 1
  if (value === 2) return 2
  if (value === 3) return 3
  if (value === 4) return 4
  return 5
}

// Outfit recommendation based on temperature + pollen — returns i18n keys
export function getOutfitRecommendation(
  temp: number,
  pollenLevel: PollenLevel
): { items: OutfitItem[]; summary: OutfitSummary } {
  const needsMask = pollenLevel >= 3
  const needsGlasses = pollenLevel >= 4

  let baseItems: OutfitItem[]
  let summaryBaseKey: string

  if (temp >= 28) {
    baseItems = [
      { icon: '👕', name: 'outfit.tshirt', recommended: true },
      { icon: '🩳', name: 'outfit.shorts', recommended: true },
      { icon: '🧴', name: 'outfit.sunscreen', recommended: true, reason: 'outfit.sunProtection' },
    ]
    summaryBaseKey = 'outfitSummary.hot'
  } else if (temp >= 23) {
    baseItems = [
      { icon: '👕', name: 'outfit.tshirt', recommended: true },
      { icon: '👖', name: 'outfit.pants', recommended: true },
      { icon: '🧣', name: 'outfit.lightLayer', recommended: false },
    ]
    summaryBaseKey = 'outfitSummary.warm'
  } else if (temp >= 18) {
    baseItems = [
      { icon: '👔', name: 'outfit.longSleeveShirt', recommended: true },
      { icon: '👖', name: 'outfit.pants', recommended: true },
      { icon: '🧥', name: 'outfit.lightJacket', recommended: false },
    ]
    summaryBaseKey = 'outfitSummary.mild'
  } else if (temp >= 13) {
    baseItems = [
      { icon: '🧥', name: 'outfit.jacket', recommended: true, reason: 'outfit.tempOptimal' },
      { icon: '👕', name: 'outfit.longSleeveShirt', recommended: true },
      { icon: '👖', name: 'outfit.pants', recommended: true },
    ]
    summaryBaseKey = 'outfitSummary.cool'
  } else if (temp >= 8) {
    baseItems = [
      { icon: '🧥', name: 'outfit.coat', recommended: true, reason: 'outfit.warmthNeeded' },
      { icon: '🧶', name: 'outfit.sweater', recommended: true },
      { icon: '👖', name: 'outfit.pants', recommended: true },
    ]
    summaryBaseKey = 'outfitSummary.cold'
  } else {
    baseItems = [
      { icon: '🧥', name: 'outfit.heavyCoat', recommended: true, reason: 'outfit.warmthEssential' },
      { icon: '🧶', name: 'outfit.sweater', recommended: true },
      { icon: '🧣', name: 'outfit.scarf', recommended: true },
      { icon: '🧤', name: 'outfit.gloves', recommended: true },
    ]
    summaryBaseKey = 'outfitSummary.veryCold'
  }

  baseItems.push({
    icon: '😷',
    name: 'outfit.mask',
    recommended: needsMask,
    reason: needsMask ? 'outfit.pollenProtection' : undefined,
  })
  baseItems.push({
    icon: '🕶️',
    name: 'outfit.sunglasses',
    recommended: needsGlasses,
    reason: needsGlasses ? 'outfit.pollenProtection' : undefined,
  })

  const summary: OutfitSummary = {
    baseKey: summaryBaseKey,
    params: { temp },
    maskSuffixKey: needsMask
      ? needsGlasses
        ? 'outfitSummary.maskSuffixExtreme'
        : 'outfitSummary.maskSuffixHigh'
      : undefined,
  }

  return { items: baseItems, summary }
}

export function isLaundryOk(pollenLevel: PollenLevel, weatherCode: number): boolean {
  return pollenLevel <= 2 && weatherCode < 51
}

export function getUVLabel(uvIndex: number): { valueKey: string; level: 'low' | 'medium' | 'high' } {
  if (uvIndex <= 2) return { valueKey: 'uv.low', level: 'low' }
  if (uvIndex <= 5) return { valueKey: 'uv.medium', level: 'medium' }
  return { valueKey: 'uv.high', level: 'high' }
}

/** Returns day-of-week index (0=Sun … 6=Sat) */
export function getDayIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

export function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number)
  return `${m}/${d}`
}

export function getPollenColor(level: PollenLevel): string {
  const colors: Record<PollenLevel, string> = {
    1: '#4ade80',
    2: '#facc15',
    3: '#fb923c',
    4: '#f87171',
    5: '#c084fc',
  }
  return colors[level]
}
