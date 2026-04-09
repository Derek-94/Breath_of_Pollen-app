import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { type PollenLevel, getPollenColor } from '@/lib/weather-utils'
import { useTheme } from '@/contexts/ThemeContext'

interface PollenCardProps {
  cedar: { typeKey: string; level: PollenLevel; labelKey: string }
  cypress: { typeKey: string; level: PollenLevel; labelKey: string }
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

export function PollenCard({ cedar, cypress, overallLevel }: PollenCardProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>{t('pollen.title')}</Text>
        <View style={[styles.badge, { backgroundColor: getPollenColor(overallLevel) + '20' }]}>
          <Text style={[styles.badgeText, { color: getPollenColor(overallLevel) }]}>
            {t(cedar.labelKey)}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.pollenItem}>
          <Text style={[styles.pollenType, isDark && styles.textMutedDark]}>
            {t(cedar.typeKey)}
          </Text>
          <Text style={[styles.pollenLabel, isDark && styles.textDark]}>
            {t(cedar.labelKey)}
          </Text>
          <PollenBar level={cedar.level} isDark={isDark} />
        </View>
        <View style={styles.pollenItem}>
          <Text style={[styles.pollenType, isDark && styles.textMutedDark]}>
            {t(cypress.typeKey)}
          </Text>
          <Text style={[styles.pollenLabel, isDark && styles.textDark]}>
            {t(cypress.labelKey)}
          </Text>
          <PollenBar level={cypress.level} isDark={isDark} />
        </View>
      </View>
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
})
