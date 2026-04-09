import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { PREFECTURE_COORDS, REGIONS } from '@/lib/prefecture-coords'
import { useTheme } from '@/contexts/ThemeContext'

interface LocationPickerProps {
  onSelect: (name: string, lat: number, lon: number) => void
  pollenUnavailable?: boolean
}

export function LocationPicker({ onSelect, pollenUnavailable }: LocationPickerProps) {
  const { isDark } = useTheme()

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {pollenUnavailable && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ この地域では花粉データが利用できません。日本の都道府県を選択してください。
          </Text>
        </View>
      )}

      <Text style={[styles.heading, isDark && styles.textDark]}>
        📍 都道府県を選択
      </Text>
      <Text style={[styles.subheading, isDark && styles.textMuted]}>
        花粉・天気情報を表示する地域を選んでください
      </Text>

      {Object.entries(REGIONS).map(([region, prefectures]) => (
        <View key={region} style={styles.regionBlock}>
          <Text style={[styles.regionTitle, isDark && styles.textMuted]}>{region}</Text>
          <View style={styles.grid}>
            {prefectures.map((name) => {
              const coords = PREFECTURE_COORDS[name]
              return (
                <Pressable
                  key={name}
                  style={({ pressed }) => [
                    styles.chip,
                    isDark && styles.chipDark,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => onSelect(name, coords.lat, coords.lon)}
                >
                  <Text style={[styles.chipText, isDark && styles.textDark]}>{name}</Text>
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
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipDark: {
    backgroundColor: '#2a2a2a',
  },
  chipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
})
