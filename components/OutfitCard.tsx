import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { type OutfitItem, type OutfitSummary } from '@/lib/weather-utils'
import { useTheme } from '@/contexts/ThemeContext'

interface OutfitCardProps {
  items: OutfitItem[]
  summary: OutfitSummary
  onPress: () => void
}

export function OutfitCard({ items, summary, onPress }: OutfitCardProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const recommended = items.filter((i) => i.recommended)

  const summaryText =
    t(summary.baseKey, summary.params) +
    (summary.maskSuffixKey ? t(summary.maskSuffixKey) : '')

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isDark && styles.cardDark,
        pressed && styles.cardPressed,
      ]}
    >
      <Text style={[styles.title, isDark && styles.textDark]}>{t('outfit.cardTitle')}</Text>
      <Text style={[styles.summary, isDark && styles.textMutedDark]}>{summaryText}</Text>

      <View style={styles.itemRow}>
        {recommended.map((item) => (
          <View key={item.name} style={[styles.itemChip, isDark && styles.chipDark]}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={[styles.itemName, isDark && styles.textDark]}>{t(item.name)}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.tapHint, isDark && styles.textMutedDark]}>
        {t('outfit.tapHint')}
      </Text>
    </Pressable>
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
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  summary: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  textDark: {
    color: '#eee',
  },
  textMutedDark: {
    color: '#999',
  },
  itemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  chipDark: {
    backgroundColor: '#2a2a2a',
  },
  itemIcon: {
    fontSize: 16,
  },
  itemName: {
    fontSize: 13,
    color: '#333',
  },
  tapHint: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
})
