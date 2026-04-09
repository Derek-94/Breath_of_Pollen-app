import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import { useLocationContext } from '@/contexts/LocationContext'
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext'
import { LocationPicker } from '@/components/LocationPicker'

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'システム' },
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
]

export default function SettingsScreen() {
  const { isDark, themeMode, setThemeMode } = useTheme()
  const { location, setManualLocation, clearSavedLocation } = useLocationContext()
  const [showPicker, setShowPicker] = useState(false)

  const handlePrefectureSelect = useCallback(
    (name: string, lat: number, lon: number) => {
      setManualLocation(lat, lon, name)
      setShowPicker(false)
    },
    [setManualLocation],
  )

  const handleResetLocation = useCallback(async () => {
    await clearSavedLocation()
  }, [clearSavedLocation])

  const appVersion = Constants.expoConfig?.version ?? '1.0.0'

  if (showPicker) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.pickerHeader}>
          <Pressable onPress={() => setShowPicker(false)}>
            <Text style={[styles.backText, isDark && styles.tintDark]}>← 戻る</Text>
          </Pressable>
        </View>
        <LocationPicker onSelect={handlePrefectureSelect} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.header, isDark && styles.textDark]}>設定</Text>

        {/* Location section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>地域</Text>

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>現在の地域</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>
              {location?.name ?? '自動検出'}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.buttonText}>都道府県を変更</Text>
          </Pressable>

          {location?.name && (
            <Pressable onPress={handleResetLocation}>
              <Text style={[styles.resetText, isDark && styles.tintDark]}>
                GPS自動検出に戻す
              </Text>
            </Pressable>
          )}
        </View>

        {/* Theme section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>テーマ</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.themeChip,
                  isDark && styles.themeChipDark,
                  themeMode === opt.value && styles.themeChipActive,
                  themeMode === opt.value && isDark && styles.themeChipActiveDark,
                ]}
                onPress={() => setThemeMode(opt.value)}
              >
                <Text style={[
                  styles.themeChipText,
                  isDark && styles.textMuted,
                  themeMode === opt.value && styles.themeChipTextActive,
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* App info section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>アプリ情報</Text>

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>アプリ名</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>花粉の呼吸</Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>バージョン</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>v{appVersion}</Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.textMuted]}>データ提供</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>
              Open-Meteo / Google Pollen
            </Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <Pressable
            style={styles.row}
            onPress={() => Linking.openURL('https://github.com/Derek-94/Breath_of_Pollen-app')}
          >
            <Text style={[styles.label, isDark && styles.textMuted]}>ソースコード</Text>
            <Text style={[styles.linkText, isDark && styles.tintDark]}>GitHub →</Text>
          </Pressable>
        </View>

        <Text style={[styles.footer, isDark && styles.textMuted]}>
          Made with ❤️ for allergy sufferers
        </Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#f0f0f0',
  },
  dividerDark: {
    backgroundColor: '#333',
  },
  button: {
    backgroundColor: '#f87171',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resetText: {
    fontSize: 13,
    color: '#f87171',
    textAlign: 'center',
    marginTop: 10,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  themeChipDark: {
    backgroundColor: '#2a2a2a',
  },
  themeChipActive: {
    backgroundColor: '#f87171',
  },
  themeChipActiveDark: {
    backgroundColor: '#fb923c',
  },
  themeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  themeChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f87171',
  },
  tintDark: {
    color: '#fb923c',
  },
  footer: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 20,
  },
  textDark: {
    color: '#eee',
  },
  textMuted: {
    color: '#999',
  },
  pickerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#f87171',
  },
})
