import { useState, useCallback, useEffect } from 'react'
import { usePostHog } from 'posthog-react-native'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocationContext } from '@/contexts/LocationContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useWeatherDataContext } from '@/contexts/WeatherDataContext'
import { PollenCard } from '@/components/PollenCard'
import { OutfitCard } from '@/components/OutfitCard'
import { InfoCard } from '@/components/InfoCard'
import { HourlyChart } from '@/components/HourlyChart'
import { OutfitDetail } from '@/components/OutfitDetail'
import { InfoCardDetail } from '@/components/InfoCardDetail'
import { PollenDetail } from '@/components/PollenDetail'
import { LocationPicker } from '@/components/LocationPicker'
import { ReviewPrompt } from '@/components/ReviewPrompt'
import { getUVLabel, getPM25Label, getLaundryStatus } from '@/lib/weather-utils'
import { localizeLocationName } from '@/lib/prefecture-i18n'
import { shouldShowReviewPrompt } from '@/lib/review'

function Logo() {
  const { isDark } = useTheme()
  const dots = ['#4ade80', '#facc15', '#fb923c', '#f87171', '#c084fc']

  return (
    <View style={styles.logoContainer}>
      <View style={styles.dotsRow}>
        {dots.map((color) => (
          <View key={color} style={[styles.dot, { backgroundColor: color }]} />
        ))}
      </View>
    </View>
  )
}

export default function TodayScreen() {
  const { isDark } = useTheme()
  const posthog = usePostHog()
  const { t, i18n } = useTranslation()
  const { location, loading: locationLoading, error: locationError, setManualLocation, clearSavedLocation } = useLocationContext()
  const { data, loading: dataLoading, error: dataError, pollenUnavailable, refetch } = useWeatherDataContext()

  const [showOutfitDetail, setShowOutfitDetail] = useState(false)
  const [showPollenDetail, setShowPollenDetail] = useState(false)
  const [activeInfoCard, setActiveInfoCard] = useState<'uv' | 'pm25' | 'humidity' | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)

  useEffect(() => {
    if (data) {
      shouldShowReviewPrompt().then((show) => {
        if (show) setShowReviewPrompt(true)
      })
    }
  }, [data])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    posthog.capture('refresh_triggered', { tab: 'today' })
    await refetch()
    setRefreshing(false)
  }, [refetch, posthog])

  const handlePrefectureSelect = useCallback(
    (name: string, lat: number, lon: number) => {
      setManualLocation(lat, lon, name)
      setShowPicker(false)
    },
    [setManualLocation],
  )

  const handleResetLocation = useCallback(async () => {
    await clearSavedLocation()
    setShowPicker(false)
  }, [clearSavedLocation])

  // Show picker if no location or pollen unavailable
  const shouldShowPicker = showPicker || (!locationLoading && !location) || locationError || pollenUnavailable

  if (shouldShowPicker) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={[styles.container, isDark && styles.containerDark]}>
        <Logo />
        <LocationPicker
          onSelect={handlePrefectureSelect}
          onReset={handleResetLocation}
          pollenUnavailable={pollenUnavailable}
          currentLocationName={location?.name}
        />
      </SafeAreaView>
    )
  }

  if (locationLoading || dataLoading) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={[styles.container, isDark && styles.containerDark, styles.center]}>
        <ActivityIndicator size="large" color={isDark ? '#fb923c' : '#f87171'} />
        <Text style={[styles.loadingText, isDark && styles.textMutedDark]}>
          {t('common.loading')}
        </Text>
      </SafeAreaView>
    )
  }

  if (dataError || !data) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={[styles.container, isDark && styles.containerDark, styles.center]}>
        <Text style={[styles.errorText, isDark && styles.textDark]}>
          {dataError ?? t('common.error')}
        </Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </Pressable>
        <Pressable style={styles.pickerLink} onPress={() => setShowPicker(true)}>
          <Text style={[styles.pickerLinkText, isDark && styles.textMutedDark]}>
            {t('common.selectPrefecture')}
          </Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const uvLabel = getUVLabel(data.uvIndex)
  const pm25Label = getPM25Label(data.pm2_5)

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Logo />

        {/* Location */}
        <Pressable style={styles.locationRow} onPress={() => setShowPicker(true)}>
          <Text style={[styles.locationText, isDark && styles.textMutedDark]}>
            📍 {localizeLocationName(data.location, i18n.language)}
          </Text>
        </Pressable>

        {/* Temperature hero */}
        <View style={styles.heroRow}>
          <View>
            <View style={styles.tempRow}>
              <Text style={[styles.tempLarge, isDark && styles.textDark]}>
                {data.temperature}
              </Text>
              <Text style={[styles.tempUnit, isDark && styles.textMutedDark]}>°C</Text>
              <Text style={styles.weatherEmoji}>
                {(() => {
                  const emojis: Record<string, string> = {
                    sunny: '☀️',
                    'partly-cloudy': '🌤️',
                    cloudy: '☁️',
                    foggy: '🌫️',
                    rainy: '🌧️',
                    snowy: '❄️',
                  }
                  return emojis[data.weatherType] ?? '🌤️'
                })()}
              </Text>
            </View>
            <View style={styles.weatherDescRow}>
              <Text style={[styles.weatherDesc, isDark && styles.textMutedDark]}>
                {t(data.descriptionKey)} · {data.high}° / {data.low}°
              </Text>
              {data.needsUmbrella && (
                <View style={[styles.umbrellaBadge, isDark && styles.umbrellaBadgeDark]}>
                  <Text style={[styles.umbrellaText, isDark && styles.umbrellaTextDark]}>
                    ☂️ {t('weather.bringUmbrella')}
                  </Text>
                </View>
              )}
            </View>
            {data.yesterdayComparison && (() => {
              const { tempDiff, pollenDiff } = data.yesterdayComparison
              const absDiff = Math.abs(tempDiff)
              const tempKey = tempDiff <= -3 ? 'comparison.tempColder' : tempDiff >= 3 ? 'comparison.tempWarmer' : 'comparison.tempSimilar'
              const tempBg = isDark
                ? (tempDiff <= -3 ? '#1e3a5f' : tempDiff >= 3 ? '#7c2d12' : '#374151')
                : (tempDiff <= -3 ? '#dbeafe' : tempDiff >= 3 ? '#fed7aa' : '#f3f4f6')
              const tempColor = isDark
                ? (tempDiff <= -3 ? '#93c5fd' : tempDiff >= 3 ? '#fdba74' : '#9ca3af')
                : (tempDiff <= -3 ? '#1e40af' : tempDiff >= 3 ? '#c2410c' : '#6b7280')
              const pollenKey = pollenDiff != null
                ? (pollenDiff > 0 ? 'comparison.pollenWorse' : pollenDiff < 0 ? 'comparison.pollenBetter' : 'comparison.pollenSimilar')
                : null
              const pollenBg = isDark
                ? (pollenDiff != null && pollenDiff > 0 ? '#7f1d1d' : pollenDiff != null && pollenDiff < 0 ? '#14532d' : '#374151')
                : (pollenDiff != null && pollenDiff > 0 ? '#fee2e2' : pollenDiff != null && pollenDiff < 0 ? '#dcfce7' : '#f3f4f6')
              const pollenColor = isDark
                ? (pollenDiff != null && pollenDiff > 0 ? '#fca5a5' : pollenDiff != null && pollenDiff < 0 ? '#86efac' : '#9ca3af')
                : (pollenDiff != null && pollenDiff > 0 ? '#dc2626' : pollenDiff != null && pollenDiff < 0 ? '#16a34a' : '#6b7280')
              return (
                <View style={styles.comparisonContainer}>
                  <Text style={[styles.comparisonLabel, isDark && styles.textMutedDark]}>
                    {t('comparison.label')}
                  </Text>
                  <View style={styles.pillsRow}>
                    <View style={[styles.pill, { backgroundColor: tempBg }]}>
                      <Text style={[styles.pillText, { color: tempColor }]}>
                        {t(tempKey, { diff: absDiff })}
                      </Text>
                    </View>
                    {pollenKey != null && (
                      <View style={[styles.pill, { backgroundColor: pollenBg }]}>
                        <Text style={[styles.pillText, { color: pollenColor }]}>
                          {t(pollenKey)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )
            })()}
          </View>
        </View>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          <PollenCard
            plants={data.pollenPlants}
            overallLevel={data.pollenOverall}
            onPress={() => {
              posthog.capture('pollen_detail_opened', { pollen_level: data.pollenOverall })
              setShowPollenDetail(true)
            }}
          />

          <OutfitCard
            items={data.outfitItems}
            summary={data.outfitSummary}
            onPress={() => {
              posthog.capture('outfit_detail_opened', { pollen_level: data.pollenOverall })
              setShowOutfitDetail(true)
            }}
          />

          <View style={styles.infoRow}>
            <InfoCard
              type="uv"
              value={t(uvLabel.valueKey)}
              label={t('uv.label')}
              level={uvLabel.level}
              onPress={() => {
                posthog.capture('info_card_opened', { type: 'uv' })
                setActiveInfoCard('uv')
              }}
            />
            <InfoCard
              type="pm25"
              value={t(pm25Label.valueKey)}
              label={t('pm25.label')}
              level={pm25Label.level}
              onPress={() => {
                posthog.capture('info_card_opened', { type: 'pm25' })
                setActiveInfoCard('pm25')
              }}
            />
            <InfoCard
              type="humidity"
              value={`${data.humidity}%`}
              label={t('humidity.label')}
              level={data.humidity > 70 ? 'high' : data.humidity > 40 ? 'medium' : 'low'}
              onPress={() => {
                posthog.capture('info_card_opened', { type: 'humidity' })
                setActiveInfoCard('humidity')
              }}
            />
          </View>

          <HourlyChart data={data.hourlyData} />
        </View>
      </ScrollView>

      {activeInfoCard && (
        <InfoCardDetail
          type={activeInfoCard}
          level={
            activeInfoCard === 'uv' ? uvLabel.level :
            activeInfoCard === 'pm25' ? pm25Label.level :
            data.humidity > 70 ? 'high' : data.humidity > 40 ? 'medium' : 'low'
          }
          numericValue={
            activeInfoCard === 'uv' ? data.uvIndex :
            activeInfoCard === 'pm25' ? data.pm2_5 :
            data.humidity
          }
          onClose={() => setActiveInfoCard(null)}
        />
      )}

      {showPollenDetail && (
        <PollenDetail
          plants={data.pollenPlants}
          overallLevel={data.pollenOverall}
          weeklyForecast={data.weeklyForecast}
          country={data.country}
          onClose={() => setShowPollenDetail(false)}
        />
      )}

      {showOutfitDetail && (
        <OutfitDetail
          items={data.outfitItems}
          temperature={{ high: data.high, low: data.low }}
          pollenLevel={data.pollenOverall}
          isOffSeason={data.country === 'KR' && data.pollenPlants.length === 0}
          laundryStatus={getLaundryStatus(data.pollenOverall, data.weatherCode)}
          onClose={() => setShowOutfitDetail(false)}
        />
      )}

      {showReviewPrompt && (
        <ReviewPrompt onClose={() => setShowReviewPrompt(false)} />
      )}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 4,
    color: '#333',
  },
  textDark: {
    color: '#eee',
  },
  textMutedDark: {
    color: '#999',
  },
  locationRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  heroRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tempLarge: {
    fontSize: 72,
    fontWeight: '200',
    color: '#111',
    lineHeight: 80,
  },
  tempUnit: {
    fontSize: 28,
    color: '#999',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  weatherDescRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  weatherDesc: {
    fontSize: 16,
    color: '#666',
  },
  umbrellaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  umbrellaBadgeDark: {
    backgroundColor: '#1e3a5f',
  },
  umbrellaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0369a1',
  },
  umbrellaTextDark: {
    color: '#7dd3fc',
  },
  comparisonContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparisonLabel: {
    fontSize: 11,
    color: '#999',
    letterSpacing: 0.5,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  weatherEmoji: {
    fontSize: 64,
    marginLeft: 'auto',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#f87171',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pickerLink: {
    padding: 8,
  },
  pickerLinkText: {
    fontSize: 13,
    color: '#888',
    textDecorationLine: 'underline',
  },
})
