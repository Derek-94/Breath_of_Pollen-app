import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { type PollenLevel, getPollenColor, POLLEN_LABEL_KEYS } from '@/lib/weather-utils'
import { useTheme } from '@/contexts/ThemeContext'

interface PollenCardProps {
  plants: { typeKey: string; level: PollenLevel; labelKey: string }[]
  overallLevel: PollenLevel
}

function PollenBar({ level, isDark }: { level: PollenLevel; isDark: boolean }) {
  return (
    <View style={styles.barContainer}>
      {([1, 2, 3, 4, 5] as PollenLevel[]).map((l) => (
        <View
          key={l}
          style={[
            styles.barDot,
            { backgroundColor: l <= level ? getPollenColor(level) : isDark ? '#333' : '#e5e5e5' },
          ]}
        />
      ))}
    </View>
  )
}

export function PollenCard({ plants, overallLevel }: PollenCardProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>{t('pollen.title')}</Text>
        {plants.length > 0 && (
          <View style={[styles.badge, { backgroundColor: getPollenColor(overallLevel) + '20' }]}>
            <Text style={[styles.badgeText, { color: getPollenColor(overallLevel) }]}>
              {t(POLLEN_LABEL_KEYS[overallLevel])}
            </Text>
          </View>
        )}
      </View>

      {plants.length === 0 ? (
        <Text style={[styles.offSeasonText, isDark && styles.textMutedDark]}>
          {t('pollen.offSeason')}
        </Text>
      ) : (
        <View style={styles.row}>
          {plants.map((plant) => (
            <View key={plant.typeKey} style={styles.pollenItem}>
              <Text style={[styles.pollenType, isDark && styles.textMutedDark]}>
                {t(plant.typeKey)}
              </Text>
              <Text style={[styles.pollenLabel, isDark && styles.textDark]}>
                {t(plant.labelKey)}
              </Text>
              <PollenBar level={plant.level} isDark={isDark} />
            </View>
          ))}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  textDark: {
    color: '#eee',
  },
  textMutedDark: {
    color: '#999',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  pollenItem: {
    flex: 1,
  },
  pollenType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  pollenLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  barDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  offSeasonText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 8,
  },
})
