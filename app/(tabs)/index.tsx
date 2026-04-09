import { useState, useCallback } from 'react'
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
import { useWeatherData } from '@/hooks/useWeatherData'
import { PollenCard } from '@/components/PollenCard'
import { OutfitCard } from '@/components/OutfitCard'
import { InfoCard } from '@/components/InfoCard'
import { HourlyChart } from '@/components/HourlyChart'
import { OutfitDetail } from '@/components/OutfitDetail'
import { LocationPicker } from '@/components/LocationPicker'
import { getUVLabel, isLaundryOk } from '@/lib/weather-utils'

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
      <Text style={[styles.logoText, isDark && styles.textDark]}>花粉の呼吸</Text>
    </View>
  )
}

export default function TodayScreen() {
  const { isDark } = useTheme()
  const { location, loading: locationLoading, error: locationError, setManualLocation } = useLocationContext()
  const { data, loading: dataLoading, error: dataError, pollenUnavailable, refetch } = useWeatherData(
    location?.lat ?? null,
    location?.lon ?? null,
    location?.name,
  )

  const [showOutfitDetail, setShowOutfitDetail] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handlePrefectureSelect = useCallback(
    (name: string, lat: number, lon: number) => {
      setManualLocation(lat, lon, name)
      setShowPicker(false)
    },
    [setManualLocation],
  )

  // Show picker if no location or pollen unavailable
  const shouldShowPicker = showPicker || (!locationLoading && !location) || locationError || pollenUnavailable

  if (shouldShowPicker) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <Logo />
        <LocationPicker
          onSelect={handlePrefectureSelect}
          pollenUnavailable={pollenUnavailable}
        />
      </SafeAreaView>
    )
  }

  if (locationLoading || dataLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark, styles.center]}>
        <ActivityIndicator size="large" color={isDark ? '#fb923c' : '#f87171'} />
        <Text style={[styles.loadingText, isDark && styles.textMutedDark]}>
          天気情報を取得中...
        </Text>
      </SafeAreaView>
    )
  }

  if (dataError || !data) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark, styles.center]}>
        <Text style={[styles.errorText, isDark && styles.textDark]}>
          {dataError ?? 'データの取得に失敗しました'}
        </Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>再試行</Text>
        </Pressable>
        <Pressable style={styles.pickerLink} onPress={() => setShowPicker(true)}>
          <Text style={[styles.pickerLinkText, isDark && styles.textMutedDark]}>
            都道府県から選ぶ
          </Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const uvLabel = getUVLabel(data.uvIndex)

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
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
            📍 {data.location}
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
            </View>
            <Text style={[styles.weatherDesc, isDark && styles.textMutedDark]}>
              {data.description} · {data.high}° / {data.low}°
            </Text>
          </View>
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

        {/* Cards */}
        <View style={styles.cardsContainer}>
          <PollenCard
            cedar={data.pollenCedar}
            cypress={data.pollenCypress}
            overallLevel={data.pollenOverall}
          />

          <OutfitCard
            items={data.outfitItems}
            summary={data.outfitSummary}
            onPress={() => setShowOutfitDetail(true)}
          />

          <View style={styles.infoRow}>
            <InfoCard type="uv" value={uvLabel.value} label="UV指数" level={uvLabel.level} />
            <InfoCard type="pm25" value="良好" label="PM2.5" level="low" />
            <InfoCard
              type="humidity"
              value={`${data.humidity}%`}
              label="湿度"
              level={data.humidity > 70 ? 'high' : data.humidity > 40 ? 'medium' : 'low'}
            />
          </View>

          <HourlyChart data={data.hourlyData} />
        </View>
      </ScrollView>

      {showOutfitDetail && (
        <OutfitDetail
          items={data.outfitItems}
          temperature={{ high: data.high, low: data.low }}
          pollenLevel={data.pollenOverall}
          laundryOk={isLaundryOk(data.pollenOverall, data.weatherCode)}
          onClose={() => setShowOutfitDetail(false)}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  },
  weatherDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  weatherEmoji: {
    fontSize: 64,
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
