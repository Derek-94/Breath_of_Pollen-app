import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  useColorScheme,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocation } from '@/hooks/useLocation'
import { useWeatherData } from '@/hooks/useWeatherData'
import { getPollenColor, POLLEN_LABELS, type PollenLevel } from '@/lib/weather-utils'

function PollenDot({ level }: { level: PollenLevel }) {
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
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { location, loading: locationLoading } = useLocation()
  const { data, loading: dataLoading, error, refetch } = useWeatherData(
    location?.lat ?? null,
    location?.lon ?? null,
    location?.name,
  )

  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  if (locationLoading || dataLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark, styles.center]}>
        <ActivityIndicator size="large" color={isDark ? '#fb923c' : '#f87171'} />
      </SafeAreaView>
    )
  }

  if (error || !data) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark, styles.center]}>
        <Text style={[styles.errorText, isDark && styles.textDark]}>
          {error ?? 'データの取得に失敗しました'}
        </Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>再試行</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const forecast = data.weeklyForecast
  const allLows = forecast.map((d) => d.low)
  const allHighs = forecast.map((d) => d.high)
  const weekLow = Math.min(...allLows)
  const weekHigh = Math.max(...allHighs)

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={[styles.header, isDark && styles.textDark]}>週間予報</Text>
        <Text style={[styles.locationText, isDark && styles.textMuted]}>
          📍 {data.location}
        </Text>

        {/* Pollen legend */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.legendTitle, isDark && styles.textDark]}>花粉レベル</Text>
          <View style={styles.legendRow}>
            {([1, 2, 3, 4, 5] as PollenLevel[]).map((level) => (
              <View key={level} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getPollenColor(level) }]} />
                <Text style={[styles.legendText, isDark && styles.textMuted]}>
                  {POLLEN_LABELS[level]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
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
                    {i === 0 ? '今日' : `${day.day}曜`}
                  </Text>
                  <Text style={[styles.dateText, isDark && styles.textMuted]}>
                    {day.date}
                  </Text>
                </View>

                <Text style={styles.weatherIcon}>{day.icon}</Text>

                <PollenDot level={day.pollenLevel} />

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
