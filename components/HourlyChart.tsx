import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

interface HourlyChartProps {
  data: { hour: number; temp: number; icon: string }[]
}

export function HourlyChart({ data }: HourlyChartProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()

  if (data.length === 0) return null

  const temps = data.map((d) => d.temp)
  const maxTemp = Math.max(...temps)
  const minTemp = Math.min(...temps)
  const range = maxTemp - minTemp || 1

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <Text style={[styles.title, isDark && styles.textDark]}>{t('hourly.title')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartRow}>
          {data.map((item, i) => {
            const barHeight = 20 + ((item.temp - minTemp) / range) * 40
            return (
              <View key={i} style={styles.chartItem}>
                <Text style={[styles.chartTemp, isDark && styles.textDark]}>
                  {item.temp}°
                </Text>
                <View
                  style={[
                    styles.chartBar,
                    { height: barHeight, backgroundColor: isDark ? '#fb923c' : '#f87171' },
                  ]}
                />
                <Text style={styles.chartIcon}>{item.icon}</Text>
                <Text style={[styles.chartHour, isDark && styles.textMutedDark]}>
                  {t('hourly.hourFormat', { h: item.hour })}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  textDark: {
    color: '#eee',
  },
  textMutedDark: {
    color: '#999',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    paddingBottom: 4,
  },
  chartItem: {
    alignItems: 'center',
    width: 44,
  },
  chartTemp: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chartBar: {
    width: 24,
    borderRadius: 12,
    marginBottom: 4,
  },
  chartIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  chartHour: {
    fontSize: 11,
    color: '#999',
    width: 44,
    textAlign: 'center',
  },
})
