import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { usePostHog } from 'posthog-react-native'
import { useTranslation } from 'react-i18next'
import { PREFECTURE_COORDS, REGIONS } from '@/lib/prefecture-coords'
import {
  PREFECTURE_ROMANIZED,
  PREFECTURE_HIGHLIGHT_EMOJI,
  REGIONS_ROMANIZED,
} from '@/lib/prefecture-i18n'
import { useTheme } from '@/contexts/ThemeContext'

interface LocationPickerProps {
  onSelect: (name: string, lat: number, lon: number) => void
  pollenUnavailable?: boolean
}

export function LocationPicker({ onSelect, pollenUnavailable }: LocationPickerProps) {
  const { isDark } = useTheme()
  const posthog = usePostHog()
  const { t, i18n } = useTranslation()

  const isJapanese = i18n.language === 'ja'

  function getDisplayName(jaKey: string): string {
    if (isJapanese) return jaKey
    return PREFECTURE_ROMANIZED[jaKey] ?? jaKey
  }

  function getRegionDisplayName(jaKey: string): string {
    if (isJapanese) return jaKey
    return REGIONS_ROMANIZED[jaKey] ?? jaKey
  }

  function getHighlightEmoji(jaKey: string): string | undefined {
    return PREFECTURE_HIGHLIGHT_EMOJI[jaKey]
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {pollenUnavailable && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            {t('locationPicker.warning')}
          </Text>
        </View>
      )}

      <Text style={[styles.heading, isDark && styles.textDark]}>
        {t('locationPicker.heading')}
      </Text>
      <Text style={[styles.subheading, isDark && styles.textMuted]}>
        {t('locationPicker.subheading')}
      </Text>

      {Object.entries(REGIONS).map(([region, prefectures]) => (
        <View key={region} style={styles.regionBlock}>
          <Text style={[styles.regionTitle, isDark && styles.textMuted]}>
            {getRegionDisplayName(region)}
          </Text>
          <View style={styles.grid}>
            {prefectures.map((jaKey) => {
              const coords = PREFECTURE_COORDS[jaKey]
              const displayName = getDisplayName(jaKey)
              const emoji = !isJapanese ? getHighlightEmoji(jaKey) : undefined
              const isHighlight = !!emoji

              return (
                <Pressable
                  key={jaKey}
                  style={({ pressed }) => [
                    styles.chip,
                    isDark && styles.chipDark,
                    isHighlight && styles.chipHighlight,
                    isHighlight && isDark && styles.chipHighlightDark,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => {
                    posthog.capture('location_selected', { prefecture: jaKey })
                    // Pass romanized name as display name; coords come from Japanese key lookup
                    onSelect(displayName, coords.lat, coords.lon)
                  }}
                >
                  {emoji && <Text style={styles.chipEmoji}>{emoji}</Text>}
                  <Text style={[
                    styles.chipText,
                    isDark && styles.textDark,
                    isHighlight && styles.chipTextHighlight,
                  ]}>
                    {displayName}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  warning: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
  },
  textDark: {
    color: '#eee',
  },
  textMuted: {
    color: '#999',
  },
  regionBlock: {
    marginBottom: 16,
  },
  regionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  chipDark: {
    backgroundColor: '#2a2a2a',
  },
  chipHighlight: {
    backgroundColor: '#fff0eb',
    borderWidth: 1,
    borderColor: '#fb923c40',
  },
  chipHighlightDark: {
    backgroundColor: '#2a1f18',
    borderWidth: 1,
    borderColor: '#fb923c40',
  },
  chipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextHighlight: {
    fontWeight: '600',
  },
})
