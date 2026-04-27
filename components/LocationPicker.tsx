import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native'
import { usePostHog } from 'posthog-react-native'
import { useTranslation } from 'react-i18next'
import { PREFECTURE_COORDS, REGIONS } from '@/lib/prefecture-coords'
import { KOREA_SIDO, KOREA_SIGUNGU, KOREA_SIDO_KEYS, KOREA_SIDO_EN, KOREA_SIGUNGU_EN, KOREA_SIDO_GROUPS, getSigunguDisplayName, getKRSigunguGrouped } from '@/lib/korea-coords'
import {
  PREFECTURE_ROMANIZED,
  PREFECTURE_KOREAN,
  PREFECTURE_HIGHLIGHT_EMOJI,
  REGIONS_ROMANIZED,
  REGIONS_KOREAN,
  KOREA_SIDO_KATAKANA,
  KOREA_SIGUNGU_KATAKANA,
  KOREA_CITIES_KATAKANA,
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
  const [activeTab, setActiveTab] = useState<'JP' | 'KR'>(() => {
    if (currentLocationName?.includes('_')) return 'KR'
    if (currentLocationName && KOREA_SIDO[currentLocationName]) return 'KR'
    if (currentLocationName) return 'JP'
    return i18n.language === 'ko' ? 'KR' : 'JP'
  })
  const [selectedSido, setSelectedSido] = useState<string | null>(() => {
    if (currentLocationName?.includes('_')) {
      return KOREA_SIGUNGU[currentLocationName]?.sido ?? null
    }
    return null
  })
  const [selectedCity, setSelectedCity] = useState<string | null>(() => {
    if (currentLocationName?.includes('_')) {
      const name = currentLocationName.split('_')[1]
      const m = name.match(/^(.+시)(.+[구군])$/)
      return m ? m[1] : null
    }
    return null
  })

  function getDisplayName(jaKey: string): string {
    if (isJapanese) return jaKey
    if (i18n.language === 'ko') return PREFECTURE_KOREAN[jaKey] ?? jaKey
    return PREFECTURE_ROMANIZED[jaKey] ?? jaKey
  }

  function getRegionDisplayName(jaKey: string): string {
    if (isJapanese) return jaKey
    if (i18n.language === 'ko') return REGIONS_KOREAN[jaKey] ?? jaKey
    return REGIONS_ROMANIZED[jaKey] ?? jaKey
  }

  function getHighlightEmoji(jaKey: string): string | undefined {
    return PREFECTURE_HIGHLIGHT_EMOJI[jaKey]
  }

  function getSidoDisplayName(sido: string): string {
    if (isJapanese) return KOREA_SIDO_KATAKANA[sido] ?? sido
    if (isEnglish) return KOREA_SIDO_EN[sido] ?? sido
    return sido
  }

  function getSigunguLabel(key: string): string {
    if (isJapanese) return KOREA_SIGUNGU_KATAKANA[key] ?? getSigunguDisplayName(key)
    if (isEnglish) return KOREA_SIGUNGU_EN[key] ?? getSigunguDisplayName(key)
    return getSigunguDisplayName(key)
  }

  function getCityDisplayName(city: string): string {
    if (isJapanese) return KOREA_CITIES_KATAKANA[city] ?? city
    if (isEnglish) {
      const romanized: Record<string, string> = {
        '수원시': 'Suwon', '성남시': 'Seongnam', '안양시': 'Anyang', '부천시': 'Bucheon',
        '안산시': 'Ansan', '고양시': 'Goyang', '용인시': 'Yongin', '청주시': 'Cheongju',
        '천안시': 'Cheonan', '전주시': 'Jeonju', '포항시': 'Pohang', '창원시': 'Changwon',
      }
      return romanized[city] ?? city
    }
    return city
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
  const grouped = selectedSido ? getKRSigunguGrouped(selectedSido) : null
  const cityKeys = selectedSido && selectedCity && grouped
    ? grouped.cities.find(c => c.name === selectedCity)?.keys ?? []
    : []

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
          onPress={() => { setActiveTab('JP'); setSelectedSido(null); setSelectedCity(null) }}
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
      {activeTab === 'KR' && !selectedSido && KOREA_SIDO_GROUPS.map((group) => {
        const GROUP_JA: Record<string, string> = { '수도권': '首都圏', '강원': 'カンウォン', '충청': 'チュンチョン', '전라': 'チョルラ', '경상': 'キョンサン', '제주': 'チェジュ' }
        const GROUP_EN: Record<string, string> = { '수도권': 'Seoul Metro', '강원': 'Gangwon', '충청': 'Chungcheong', '전라': 'Jeolla', '경상': 'Gyeongsang', '제주': 'Jeju' }
        const groupLabel = isJapanese ? (GROUP_JA[group.label] ?? group.label) : isEnglish ? (GROUP_EN[group.label] ?? group.label) : group.label
        return (
        <View key={group.label} style={styles.regionBlock}>
          <Text style={[styles.regionTitle, isDark && styles.textMuted]}>{groupLabel}</Text>
          <View style={styles.sidoGrid}>
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
                  <Text style={[styles.sidoText, isDark && styles.textDark, isCurrentSido && styles.chipTextSelected]} numberOfLines={1}>
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
        </View>
        )
      })}

      {/* 한국 섹션 — 2단계: 중간 시 목록 (경기/경남/경북 등) */}
      {activeTab === 'KR' && selectedSido && !selectedCity && grouped?.hasCities && (
        <View style={styles.regionBlock}>
          <Pressable
            style={({ pressed }) => [styles.backRow, isDark && styles.backRowDark, pressed && styles.chipPressed]}
            onPress={() => setSelectedSido(null)}
          >
            <Text style={[styles.backChevron, isDark && styles.textDark]}>‹</Text>
            <Text style={[styles.backText, isDark && styles.textDark]}>{getSidoDisplayName(selectedSido)}</Text>
          </Pressable>

          {/* 하위 구가 있는 시 목록 */}
          <View style={styles.sidoGrid}>
            {grouped.cities.map((city) => {
              const isCurrentCity = currentLocationName?.includes('_') &&
                currentLocationName.split('_')[1].startsWith(city.name)
              return (
                <Pressable
                  key={city.name}
                  style={({ pressed }) => [
                    styles.sidoRow, isDark && styles.sidoRowDark,
                    isCurrentCity && styles.sidoRowSelected, isCurrentCity && isDark && styles.sidoRowSelectedDark,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => setSelectedCity(city.name)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sidoText, isDark && styles.textDark, isCurrentCity && styles.chipTextSelected]}>
                      {getCityDisplayName(city.name)}
                    </Text>
                    <Text style={[styles.citySubText, isDark && styles.textMuted]}>
                      {isJapanese ? `${city.keys.length}区` : isEnglish ? `${city.keys.length} districts` : `${city.keys.length}개 구`}
                    </Text>
                  </View>
                  {isCurrentCity
                    ? <Text style={styles.checkmark}>✓</Text>
                    : <Text style={[styles.chevron, isDark && styles.textMuted]}>›</Text>}
                </Pressable>
              )
            })}
          </View>

          {/* 단독 시/군 */}
          {grouped.standalones.length > 0 && (
            <>
              <Text style={[styles.regionTitle, isDark && styles.textMuted, { marginTop: 16 }]}>
                {isJapanese ? 'その他の市/郡' : isEnglish ? 'Other Cities & Counties' : '시/군'}
              </Text>
              <View style={styles.grid}>
                {grouped.standalones.map((key) => {
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
            </>
          )}
        </View>
      )}

      {/* 한국 섹션 — 3단계: 시 내 구 목록 */}
      {activeTab === 'KR' && selectedSido && selectedCity && (
        <View style={styles.regionBlock}>
          <Pressable
            style={({ pressed }) => [styles.backRow, isDark && styles.backRowDark, pressed && styles.chipPressed]}
            onPress={() => setSelectedCity(null)}
          >
            <Text style={[styles.backChevron, isDark && styles.textDark]}>‹</Text>
            <Text style={[styles.backText, isDark && styles.textDark]}>{getCityDisplayName(selectedCity)}</Text>
          </Pressable>
          <View style={styles.grid}>
            {cityKeys.map((key) => {
              const sg = KOREA_SIGUNGU[key]
              if (!sg) return null
              const name = key.split('_')[1]
              const koM = name.match(/^.+시(.+[구군])$/)
              let displayName: string
              if (isJapanese) {
                displayName = getSigunguLabel(key)
              } else if (isEnglish && koM) {
                // 'Suwon Jangan-gu' → 'Jangan-gu' (도시 접두어 제거)
                const fullEn = KOREA_SIGUNGU_EN[key] ?? ''
                displayName = fullEn.replace(/^\S+\s/, '') || getSigunguLabel(key)
              } else if (koM) {
                displayName = koM[1]
              } else {
                displayName = getSigunguLabel(key)
              }
              const confirmLabel = isEnglish
                ? (KOREA_SIGUNGU_EN[key] ?? `${selectedCity} ${displayName}`)
                : isJapanese
                  ? `${getCityDisplayName(selectedCity)} ${displayName}`
                  : `${selectedCity} ${displayName}`
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
                    confirmSelect(key, confirmLabel, sg.lat, sg.lon)
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

      {/* 한국 섹션 — 2단계: 평면 시/군/구 목록 (서울/부산 등 단순 구조) */}
      {activeTab === 'KR' && selectedSido && !selectedCity && !grouped?.hasCities && (
        <View style={styles.regionBlock}>
          <Pressable
            style={({ pressed }) => [styles.backRow, isDark && styles.backRowDark, pressed && styles.chipPressed]}
            onPress={() => setSelectedSido(null)}
          >
            <Text style={[styles.backChevron, isDark && styles.textDark]}>‹</Text>
            <Text style={[styles.backText, isDark && styles.textDark]}>{getSidoDisplayName(selectedSido)}</Text>
          </Pressable>
          <View style={styles.grid}>
            {(KOREA_SIDO_KEYS[selectedSido] ?? []).map((key) => {
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
  sidoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  sidoRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f0f0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    width: '48.5%',
  },
  sidoRowDark: { backgroundColor: '#2a2a2a' },
  sidoRowSelected: { backgroundColor: '#fff0eb', borderWidth: 1.5, borderColor: '#f87171' },
  sidoRowSelectedDark: { backgroundColor: '#2a1a1a', borderWidth: 1.5, borderColor: '#fb923c' },
  sidoText: { fontSize: 14, fontWeight: '500', color: '#333' },
  citySubText: { fontSize: 11, color: '#aaa', marginTop: 1 },
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
