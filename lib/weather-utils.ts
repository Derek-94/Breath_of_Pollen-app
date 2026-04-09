export type WeatherType = "sunny" | "cloudy" | "rainy" | "snowy" | "partly-cloudy" | "foggy"
export type PollenLevel = 1 | 2 | 3 | 4 | 5

export interface OutfitItem {
  icon: string
  name: string
  recommended: boolean
  reason?: string
}

export const POLLEN_LABELS: Record<PollenLevel, string> = {
  1: "少ない",
  2: "やや多い",
  3: "多い",
  4: "非常に多い",
  5: "極めて多い",
}

// WMO weather code → WeatherType + emoji + description
export function getWeatherInfo(code: number): {
  type: WeatherType
  emoji: string
  description: string
} {
  if (code === 0) return { type: 'sunny', emoji: '☀️', description: '快晴' }
  if (code <= 2) return { type: 'partly-cloudy', emoji: '🌤️', description: '晴れ時々曇り' }
  if (code === 3) return { type: 'cloudy', emoji: '☁️', description: '曇り' }
  if (code <= 48) return { type: 'foggy', emoji: '🌫️', description: '霧' }
  if (code <= 67) return { type: 'rainy', emoji: '🌧️', description: '雨' }
  if (code <= 77) return { type: 'snowy', emoji: '❄️', description: '雪' }
  if (code <= 82) return { type: 'rainy', emoji: '🌦️', description: 'にわか雨' }
  return { type: 'rainy', emoji: '⛈️', description: '雷雨' }
}

// Google Pollen API index (0–5) → our 1–5 scale
export function mapPollenIndex(value: number | undefined | null): PollenLevel {
  if (!value || value <= 1) return 1
  if (value === 2) return 2
  if (value === 3) return 3
  if (value === 4) return 4
  return 5
}

// Outfit recommendation based on temperature + pollen
export function getOutfitRecommendation(
  temp: number,
  pollenLevel: PollenLevel
): { items: OutfitItem[]; summary: string } {
  const needsMask = pollenLevel >= 3
  const needsGlasses = pollenLevel >= 4

  let baseItems: OutfitItem[]
  let summary: string

  if (temp >= 28) {
    baseItems = [
      { icon: '👕', name: 'Tシャツ', recommended: true },
      { icon: '🩳', name: 'ショートパンツ', recommended: true },
      { icon: '🧴', name: '日焼け止め', recommended: true, reason: '紫外線対策' },
    ]
    summary = `気温${temp}°Cと暑め → 薄着で`
  } else if (temp >= 23) {
    baseItems = [
      { icon: '👕', name: 'Tシャツ', recommended: true },
      { icon: '👖', name: 'パンツ', recommended: true },
      { icon: '🧣', name: '薄手の羽織', recommended: false },
    ]
    summary = `気温${temp}°Cと快適 → 薄手の服装で`
  } else if (temp >= 18) {
    baseItems = [
      { icon: '👔', name: '長袖シャツ', recommended: true },
      { icon: '👖', name: 'パンツ', recommended: true },
      { icon: '🧥', name: '薄手ジャケット', recommended: false },
    ]
    summary = `気温${temp}°Cとやや涼しめ → 長袖がおすすめ`
  } else if (temp >= 13) {
    baseItems = [
      { icon: '🧥', name: 'ライトジャケット', recommended: true, reason: `気温${temp}°Cに最適` },
      { icon: '👕', name: '長袖シャツ', recommended: true },
      { icon: '👖', name: 'パンツ', recommended: true },
    ]
    summary = `気温${temp}°Cと肌寒め → ライトジャケットがおすすめ`
  } else if (temp >= 8) {
    baseItems = [
      { icon: '🧥', name: 'コート', recommended: true, reason: '防寒に必要' },
      { icon: '🧶', name: 'セーター', recommended: true },
      { icon: '👖', name: 'パンツ', recommended: true },
    ]
    summary = `気温${temp}°Cと寒い → コートが必要`
  } else {
    baseItems = [
      { icon: '🧥', name: '厚手コート', recommended: true, reason: '防寒必須' },
      { icon: '🧶', name: 'セーター', recommended: true },
      { icon: '🧣', name: 'マフラー', recommended: true },
      { icon: '🧤', name: '手袋', recommended: true },
    ]
    summary = `気温${temp}°Cと厳しい寒さ → しっかり防寒を`
  }

  baseItems.push({
    icon: '😷',
    name: 'マスク',
    recommended: needsMask,
    reason: needsMask ? '花粉対策' : undefined,
  })
  baseItems.push({
    icon: '🕶️',
    name: 'サングラス',
    recommended: needsGlasses,
    reason: needsGlasses ? '花粉対策' : undefined,
  })

  if (needsMask) {
    const pollenDesc = needsGlasses ? '極めて多い' : '多め'
    summary += `＋マスク必須（花粉${pollenDesc}）`
  }

  return { items: baseItems, summary }
}

export function isLaundryOk(pollenLevel: PollenLevel, weatherCode: number): boolean {
  return pollenLevel <= 2 && weatherCode < 51
}

export function getUVLabel(uvIndex: number): { value: string; level: 'low' | 'medium' | 'high' } {
  if (uvIndex <= 2) return { value: '弱い', level: 'low' }
  if (uvIndex <= 5) return { value: '中程度', level: 'medium' }
  return { value: '強い', level: 'high' }
}

export function getJapaneseDayOfWeek(dateStr: string): string {
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const [y, m, d] = dateStr.split('-').map(Number)
  return days[new Date(y, m - 1, d).getDay()]
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
