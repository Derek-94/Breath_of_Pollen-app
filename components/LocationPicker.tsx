import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native'
import { usePostHog } from 'posthog-react-native'
import { useTranslation } from 'react-i18next'
import { PREFECTURE_COORDS, REGIONS } from '@/lib/prefecture-coords'
import { KOREA_SIDO, KOREA_SIGUNGU, KOREA_SIDO_KEYS, KOREA_SIDO_EN, KOREA_SIGUNGU_EN, KOREA_SIDO_GROUPS, getSigunguDisplayName } from '@/lib/korea-coords'
import {
  PREFECTURE_ROMANIZED,
  PREFECTURE_HIGHLIGHT_EMOJI,
  REGIONS_ROMANIZED,
} from '@/lib/prefecture-i18n'
import { useTheme } from '@/contexts/ThemeContext'

interface LocationPickerProps {
  onSelect: (name: string, lat: number, lon: number) => void
  onReset?: () => void
  pollenUnavailable?: boolean
  currentLocationName?: string
}

export function LocationPicker({ onSelect, onReset, pollenUnavailable, currentLocationName }: LocationPickerProps) {
  const { isDark } = useTheme()
  const posthog = usePostHog()
  const { t, i18n } = useTranslation()

  const isJapanese = i18n.language === 'ja'
  const isEnglish = i18n.language === 'en'
  const [activeTab, setActiveTab] = useState<'JP' | 'KR'>(i18n.language === 'ko' ? 'KR' : 'JP')
  const [selectedSido, setSelectedSido] = useState<string | null>(() => {
    if (currentLocationName?.includes('_')) {
      return KOREA_SIGUNGU[currentLocationName]?.sido ?? null
    }
    return null
  })

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

  function getSidoDisplayName(sido: string): string {
    if (isEnglish) return KOREA_SIDO_EN[sido] ?? sido
    return sido
  }

  function getSigunguLabel(key: string): string {
    if (isEnglish) return KOREA_SIGUNGU_EN[key] ?? getSigunguDisplayName(key)
    return getSigunguDisplayName(key)
  }

  function confirmSelect(name: string, displayName: string, lat: number, lon: number) {
    Alert.alert(
      t('locationPicker.confirmTitle'),
      t('locationPicker.confirmMessage', { name: displayName }),
      [
        { text: t('locationPicker.confirmCancel'), style: 'cancel' },
        { text: t('locationPicker.confirmOk'), onPress: () => onSelect(name, lat, lon) },
      ]
    )
  }

  const sidoList = Object.keys(KOREA_SIDO)
  const sigunguKeys = selectedSido ? (KOREA_SIDO_KEYS[selectedSido] ?? []) : []

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

      {/* GPS 자동감지 */}
      <Pressable
        style={({ pressed }) => [
          styles.gpsRow,
          isDark && styles.gpsRowDark,
          !currentLocationName && styles.gpsRowSelected,
          !currentLocationName && isDark && styles.gpsRowSelectedDark,
          pressed && styles.chipPressed,
        ]}
        onPress={onReset}
        disabled={!currentLocationName}
      >
        <Text style={styles.gpsIcon}>📍</Text>
        <Text style={[styles.gpsText, isDark && styles.textDark, !currentLocationName && styles.gpsTextSelected]}>
          {t('common.autoDetect')}
        </Text>
        {!currentLocationName && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>

      {/* 국가 탭 */}
      <View style={[styles.tabRow, isDark && styles.tabRowDark]}>
        <Pressable
          style={[styles.tab, activeTab === 'JP' && styles.tabActive, activeTab === 'JP' && isDark && styles.tabActiveDark]}
          onPress={() => { setActiveTab('JP'); setSelectedSido(null) }}
        >
          <Text style={[styles.tabText, isDark && styles.tabTextDark, activeTab === 'JP' && styles.tabTextActive, activeTab === 'JP' && isDark && styles.tabTextActiveDark]}>
            {t('locationPicker.japan')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'KR' && styles.tabActive, activeTab === 'KR' && isDark && styles.tabActiveDark]}
          onPress={() => setActiveTab('KR')}
        >
          <Text style={[styles.tabText, isDark && styles.tabTextDark, activeTab === 'KR' && styles.tabTextActive, activeTab === 'KR' && isDark && styles.tabTextActiveDark]}>
            {t('locationPicker.korea')}
          </Text>
        </Pressable>
      </View>

      {/* 일본 섹션 */}
      {activeTab === 'JP' && Object.entries(REGIONS).map(([region, prefectures]) => (
        <View key={region} style={styles.regionBlock}>
          <Text style={[styles.regionTitle, isDark && styles.textMuted]}>
            {getRegionDisplayName(region)}
          </Text>
          <View style={styles.grid}>
            {prefectures.map((jaKey) => {
              const coords = PREFECTURE_COORDS[jaKey]
              const displayName = getDisplayName(jaKey)
              const emoji = !isJapanese ? getHighlightEmoji(jaKey) : undefined
              const isSelected = jaKey === currentLocationName
              return (
                <Pressable
                  key={jaKey}
                  style={({ pressed }) => [
                    styles.chip, isDark && styles.chipDark,
                    isSelected && styles.chipSelected, isSelected && isDark && styles.chipSelectedDark,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => {
                    posthog.capture('location_selected', { prefecture: jaKey, country: 'JP' })
                    confirmSelect(jaKey, displayName, coords.lat, coords.lon)
                  }}
                >
                  {emoji && <Text style={styles.chipEmoji}>{emoji}</Text>}
                  <Text style={[styles.chipText, isDark && styles.textDark, isSelected && styles.chipTextSelected]}>
                    {displayName}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              )
            })}
          </View>
        </View>
      ))}

      {/* 한국 섹션 — 시/도 리스트 (카테고리 그룹) */}
      {activeTab === 'KR' && !selectedSido && KOREA_SIDO_GROUPS.map((group) => (
        <View key={group.label} style={styles.regionBlock}>
          <Text style={[styles.regionTitle, isDark && styles.textMuted]}>{group.label}</Text>
          {group.sidos.map((sido) => {
            const displayName = getSidoDisplayName(sido)
            const isCurrentSido = currentLocationName?.includes('_') &&
              KOREA_SIGUNGU[currentLocationName]?.sido === sido
            return (
              <Pressable
                key={sido}
                style={({ pressed }) => [
                  styles.sidoRow, isDark && styles.sidoRowDark,
                  isCurrentSido && styles.sidoRowSelected, isCurrentSido && isDark && styles.sidoRowSelectedDark,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => setSelectedSido(sido)}
              >
                <Text style={[styles.sidoText, isDark && styles.textDark, isCurrentSido && styles.chipTextSelected]}>
                  {displayName}
                </Text>
                {isCurrentSido
                  ? <Text style={styles.checkmark}>✓</Text>
                  : <Text style={[styles.chevron, isDark && styles.textMuted]}>›</Text>
                }
              </Pressable>
            )
          })}
        </View>
      ))}

      {/* 한국 섹션 — 시/군/구 리스트 */}
      {activeTab === 'KR' && selectedSido && (
        <View style={styles.regionBlock}>
          <Pressable
            style={({ pressed }) => [styles.backRow, isDark && styles.backRowDark, pressed && styles.chipPressed]}
            onPress={() => setSelectedSido(null)}
          >
            <Text style={[styles.backChevron, isDark && styles.textDark]}>‹</Text>
            <Text style={[styles.backText, isDark && styles.textDark]}>{getSidoDisplayName(selectedSido)}</Text>
          </Pressable>
          <View style={styles.grid}>
            {sigunguKeys.map((key) => {
              const sg = KOREA_SIGUNGU[key]
              if (!sg) return null
              const displayName = getSigunguLabel(key)
              const isSelected = key === currentLocationName
              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.chip, isDark && styles.chipDark,
                    isSelected && styles.chipSelected, isSelected && isDark && styles.chipSelectedDark,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => {
                    posthog.capture('location_selected', { region: key, country: 'KR' })
                    confirmSelect(key, displayName, sg.lat, sg.lon)
                  }}
                >
                  <Text style={[styles.chipText, isDark && styles.textDark, isSelected && styles.chipTextSelected]}>
                    {displayName}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              )
            })}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  warning: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, marginBottom: 16 },
  warningText: { fontSize: 13, color: '#92400e' },
  heading: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  subheading: { fontSize: 13, color: '#888', marginBottom: 20 },
  textDark: { color: '#eee' },
  textMuted: { color: '#999' },
  regionBlock: { marginBottom: 16 },
  regionTitle: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f0f0', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, gap: 4,
  },
  chipDark: { backgroundColor: '#2a2a2a' },
  chipSelected: { backgroundColor: '#fff0eb', borderWidth: 1.5, borderColor: '#f87171' },
  chipSelectedDark: { backgroundColor: '#2a1a1a', borderWidth: 1.5, borderColor: '#fb923c' },
  chipTextSelected: { color: '#f87171', fontWeight: '600' },
  checkmark: { fontSize: 12, color: '#f87171', fontWeight: '700' },
  chevron: { fontSize: 16, color: '#aaa', marginLeft: 2 },
  chipPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 14, color: '#333' },
  sidoRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f0f0', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    marginBottom: 6,
  },
  sidoRowDark: { backgroundColor: '#2a2a2a' },
  sidoRowSelected: { backgroundColor: '#fff0eb', borderWidth: 1.5, borderColor: '#f87171' },
  sidoRowSelectedDark: { backgroundColor: '#2a1a1a', borderWidth: 1.5, borderColor: '#fb923c' },
  sidoText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#333' },
  backRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f0f0f0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backRowDark: { backgroundColor: '#2a2a2a' },
  backChevron: { fontSize: 20, color: '#333', lineHeight: 24 },
  backText: { fontSize: 15, fontWeight: '600', color: '#333' },
  gpsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f0f0f0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  gpsRowDark: { backgroundColor: '#2a2a2a' },
  gpsRowSelected: { backgroundColor: '#fff0eb', borderWidth: 1.5, borderColor: '#f87171' },
  gpsRowSelectedDark: { backgroundColor: '#2a1a1a', borderWidth: 1.5, borderColor: '#fb923c' },
  gpsIcon: { fontSize: 14 },
  gpsText: { flex: 1, fontSize: 14, color: '#333' },
  gpsTextSelected: { color: '#f87171', fontWeight: '600' },
  tabRow: {
    flexDirection: 'row', backgroundColor: '#f0f0f0',
    borderRadius: 12, padding: 4, marginBottom: 20, gap: 4,
  },
  tabRowDark: { backgroundColor: '#222' },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  tabActiveDark: { backgroundColor: '#333' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#999' },
  tabTextDark: { color: '#666' },
  tabTextActive: { color: '#111', fontWeight: '600' },
  tabTextActiveDark: { color: '#eee' },
})
