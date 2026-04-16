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
import { getPollenColor, POLLEN_LABEL_KEYS, type PollenLevel } from '@/lib/weather-utils'
import { localizeLocationName } from '@/lib/prefecture-i18n'

function PollenDot({ level, offSeason }: { level: PollenLevel; offSeason?: boolean }) {
  if (offSeason) {
    return (
      <View style={[styles.pollenDot, { backgroundColor: '#ccc' }]}>
        <Text style={styles.pollenDotText}>—</Text>
      </View>
    )
  }
  return (
    <View style={[styles.pollenDot, { backgroundColor: getPollenColor(level) }]}>
      <Text style={styles.pollenDotText}>{level}</Text>
    </View>
  )
}

function TempBar({ low, high, dayLow, dayHigh, isDark }: {
  low: number
  high: number
  dayLow: number
  dayHigh: number
  isDark: boolean
}) {
  const range = dayHigh - dayLow || 1
  const leftPct = ((low - dayLow) / range) * 100
  const widthPct = ((high - low) / range) * 100 || 5

  return (
    <View style={styles.tempBarContainer}>
      <Text style={[styles.tempText, isDark && styles.textMuted]}>{low}°</Text>
      <View style={[styles.tempBarTrack, isDark && styles.tempBarTrackDark]}>
        <View
          style={[
            styles.tempBarFill,
            { left: `${leftPct}%`, width: `${Math.max(widthPct, 5)}%` },
          ]}
        />
      </View>
      <Text style={[styles.tempText, isDark && styles.textMuted]}>{high}°</Text>
    </View>
  )
}

export default function WeeklyScreen() {
  const { isDark } = useTheme()
  const posthog = usePostHog()
  const { t, i18n } = useTranslation()
  const { location, loading: locationLoading } = useLocationContext()
  const { data, loading: dataLoading, error, refetch } = useWeatherDataContext()

  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    posthog.capture('weekly_tab_viewed')
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    posthog.capture('refresh_triggered', { tab: 'weekly' })
    await refetch()
    setRefreshing(false)
  }, [refetch, posthog])

  if (locationLoading || dataLoading) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={[styles.container, isDark && styles.containerDark, styles.center]}>
        <ActivityIndicator size="large" color={isDark ? '#fb923c' : '#f87171'} />
        <Text style={[styles.loadingText, isDark && styles.textMuted]}>
          {t('common.loading')}
        </Text>
      </SafeAreaView>
    )
  }

  if (error || !data) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={[styles.container, isDark && styles.containerDark, styles.center]}>
        <Text style={[styles.errorText, isDark && styles.textDark]}>
          {error ?? t('common.error')}
        </Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const isOffSeason = data.country === 'KR' && data.pollenPlants.length === 0

  const forecast = data.weeklyForecast
  const allLows = forecast.map((d) => d.low)
  const allHighs = forecast.map((d) => d.high)
  const weekLow = Math.min(...allLows)
  const weekHigh = Math.max(...allHighs)

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={[styles.header, isDark && styles.textDark]}>{t('weekly.header')}</Text>
        <Text style={[styles.locationText, isDark && styles.textMuted]}>
          📍 {localizeLocationName(data.location, i18n.language)}
        </Text>

        {/* Pollen legend / off-season notice */}
        {isOffSeason ? (
          <View style={[styles.card, isDark && styles.cardDark, styles.offSeasonCard]}>
            <Text style={styles.offSeasonEmoji}>🌿</Text>
            <Text style={[styles.offSeasonText, isDark && styles.textMuted]}>
              {t('pollen.offSeason')}
            </Text>
          </View>
        ) : (
          <View style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.legendTitle, isDark && styles.textDark]}>{t('weekly.pollenLegend')}</Text>
            <View style={styles.legendRow}>
              {([1, 2, 3, 4, 5] as PollenLevel[]).map((level) => (
                <View key={level} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: getPollenColor(level) }]} />
                  <Text style={[styles.legendText, isDark && styles.textMuted]}>
                    {t(POLLEN_LABEL_KEYS[level])}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Column headers */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerColText, isDark && styles.textMuted, { width: 52 }]}>{t('weekly.dayCol')}</Text>
            <Text style={[styles.headerColText, isDark && styles.textMuted, { width: 32, textAlign: 'center' }]}>{t('weekly.weatherCol')}</Text>
            <Text style={[styles.headerColText, isDark && styles.textMuted, { width: 24, textAlign: 'center' }]}>{t('weekly.pollenCol')}</Text>
            <View style={styles.tempHeaderContainer}>
              <Text style={[styles.headerText, isDark && styles.textMuted]}>{weekLow}°</Text>
              <Text style={[styles.headerTextCenter, isDark && styles.textMuted]}>{t('weekly.tempRange')}</Text>
              <Text style={[styles.headerText, isDark && styles.textMuted]}>{weekHigh}°</Text>
            </View>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />

          {forecast.map((day, i) => (
            <View key={day.date}>
              {i > 0 && <View style={[styles.divider, isDark && styles.dividerDark]} />}
              <View style={styles.dayRow}>
                <View style={styles.dayInfo}>
                  <Text style={[
                    styles.dayName,
                    isDark && styles.textDark,
                    i === 0 && styles.dayNameToday,
                  ]}>
                    {i === 0 ? t('common.today') : t('weekly.dayFormat', { day: t(`day.${day.dayIndex}`) })}
                  </Text>
                  <Text style={[styles.dateText, isDark && styles.textMuted]}>
                    {day.date}
                  </Text>
                </View>

                <Text style={styles.weatherIcon}>{day.icon}</Text>

                <PollenDot level={day.pollenLevel} offSeason={isOffSeason || day.pollenUnknown} />

                <TempBar
                  low={day.low}
                  high={day.high}
                  dayLow={weekLow}
                  dayHigh={weekHigh}
                  isDark={isDark}
                />
              </View>
            </View>
          ))}
        </View>

        {data.country === 'KR' && !isOffSeason && (
          <Text style={[styles.disclaimer, isDark && styles.textMuted]}>
            {t('weekly.krPollenDisclaimer')}
          </Text>
        )}
      </ScrollView>
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
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1a1a1a',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    gap: 10,
  },
  tempHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerColText: {
    fontSize: 11,
    color: '#aaa',
  },
  headerText: {
    fontSize: 11,
    color: '#aaa',
    width: 30,
    textAlign: 'center',
  },
  headerTextCenter: {
    flex: 1,
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  dayInfo: {
    width: 52,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  dayNameToday: {
    color: '#f87171',
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    marginTop: 1,
  },
  weatherIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  pollenDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollenDotText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  tempBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tempText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    width: 30,
    textAlign: 'center',
  },
  tempBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tempBarTrackDark: {
    backgroundColor: '#333',
  },
  tempBarFill: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fb923c',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#f0f0f0',
  },
  dividerDark: {
    backgroundColor: '#333',
  },
  offSeasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  offSeasonEmoji: {
    fontSize: 20,
  },
  offSeasonText: {
    fontSize: 13,
    color: '#999',
    flex: 1,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
  textDark: {
    color: '#eee',
  },
  textMuted: {
    color: '#999',
  },
  disclaimer: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
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
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
})
