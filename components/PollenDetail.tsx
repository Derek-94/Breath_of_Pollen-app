import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native'
import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type PollenLevel, getPollenColor, POLLEN_LABEL_KEYS } from '@/lib/weather-utils'
import { useTheme } from '@/contexts/ThemeContext'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_MAX = SCREEN_HEIGHT * 0.85
const DISMISS_THRESHOLD = 120

interface WeeklyDay {
  dayIndex: number
  pollenLevel: PollenLevel
  pollenUnknown: boolean
}

interface PollenDetailProps {
  plants: { typeKey: string; level: PollenLevel; labelKey: string }[]
  overallLevel: PollenLevel
  weeklyForecast: WeeklyDay[]
  country: 'JP' | 'KR' | 'OTHER'
  onClose: () => void
}

function PlantRow({
  typeKey,
  level,
  labelKey,
  isDark,
}: {
  typeKey: string
  level: PollenLevel
  labelKey: string
  isDark: boolean
}) {
  const { t } = useTranslation()
  const color = getPollenColor(level)
  return (
    <View style={styles.plantRow}>
      <View style={styles.plantMeta}>
        <Text style={[styles.plantName, isDark && styles.textMuted]}>{t(typeKey)}</Text>
        <Text style={[styles.plantLabel, { color }]}>{t(labelKey)}</Text>
      </View>
      <View style={styles.plantBarTrack}>
        {([1, 2, 3, 4, 5] as PollenLevel[]).map((l) => (
          <View
            key={l}
            style={[
              styles.plantBarSegment,
              { backgroundColor: l <= level ? color : isDark ? '#2e2e2e' : '#ebebeb' },
            ]}
          />
        ))}
      </View>
    </View>
  )
}

function WeeklyCell({
  day,
  isDark,
}: {
  day: WeeklyDay
  isDark: boolean
}) {
  const { t } = useTranslation()
  const color = day.pollenUnknown ? (isDark ? '#444' : '#ccc') : getPollenColor(day.pollenLevel)

  return (
    <View style={styles.weeklyCell}>
      <Text style={[styles.weeklyDayLabel, isDark && styles.textMuted]}>
        {t(`day.${day.dayIndex}`)}
      </Text>
      <View style={[styles.weeklyDot, { backgroundColor: color }]}>
        <Text style={styles.weeklyDotNum}>
          {day.pollenUnknown ? '?' : day.pollenLevel}
        </Text>
      </View>
    </View>
  )
}

function PollenLegend({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation()
  return (
    <View style={styles.legendRow}>
      {([1, 2, 3, 4, 5] as PollenLevel[]).map((level) => (
        <View key={level} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: getPollenColor(level) }]} />
          <Text style={[styles.legendText, isDark && styles.textMuted]}>
            {t(POLLEN_LABEL_KEYS[level])}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function PollenDetail({ plants, overallLevel, weeklyForecast, country, onClose }: PollenDetailProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()

  const backdropOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(SHEET_MAX)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(sheetTranslateY, { toValue: 0, damping: 25, stiffness: 200, useNativeDriver: true }),
    ]).start()
  }, [])

  const dismissRef = useRef<() => void>(null as unknown as () => void)

  const dismiss = () => {
    sheetTranslateY.stopAnimation()
    backdropOpacity.stopAnimation()
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: SHEET_MAX, duration: 300, useNativeDriver: true }),
    ]).start(() => onClose())
  }

  dismissRef.current = dismiss

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.dy > 0) {
          sheetTranslateY.setValue(gs.dy)
          backdropOpacity.setValue(1 - gs.dy / SHEET_MAX)
        }
      },
      onPanResponderRelease: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.5) {
          dismissRef.current()
        } else {
          Animated.parallel([
            Animated.spring(sheetTranslateY, { toValue: 0, damping: 40, stiffness: 300, overshootClamping: true, useNativeDriver: true }),
            Animated.timing(backdropOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
          ]).start()
        }
      },
    })
  ).current

  const overallColor = getPollenColor(overallLevel)
  const tipKey = `pollenDetail.tip.${overallLevel}` as const

  return (
    <Modal animationType="none" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, isDark && styles.sheetDark, { transform: [{ translateY: sheetTranslateY }] }]}
        >
          <View style={styles.handleZone} {...panResponder.panHandlers}>
            <View style={[styles.handle, isDark && styles.handleDark]} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, isDark && styles.textDark]}>
                {t('pollenDetail.title')}
              </Text>
              <View style={[styles.levelBadge, { backgroundColor: overallColor + '22' }]}>
                <Text style={[styles.levelBadgeText, { color: overallColor }]}>
                  {t(POLLEN_LABEL_KEYS[overallLevel])}
                </Text>
              </View>
            </View>

            {/* Today's plants */}
            {plants.length > 0 && (
              <View style={[styles.section, isDark && styles.sectionDark]}>
                <Text style={[styles.sectionLabel, isDark && styles.textMuted]}>
                  {t('pollenDetail.todaySection')}
                </Text>
                {plants.map((plant) => (
                  <PlantRow
                    key={plant.typeKey}
                    typeKey={plant.typeKey}
                    level={plant.level}
                    labelKey={plant.labelKey}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}

            {/* Weekly forecast */}
            {weeklyForecast.length > 0 && (
              <View style={[styles.section, isDark && styles.sectionDark]}>
                <Text style={[styles.sectionLabel, isDark && styles.textMuted]}>
                  {t('pollenDetail.weeklySection')}
                </Text>
                <PollenLegend isDark={isDark} />
                <View style={[styles.legendDivider, isDark && styles.legendDividerDark]} />
                <View style={styles.weeklyRow}>
                  {weeklyForecast.map((day, i) => (
                    <WeeklyCell key={i} day={day} isDark={isDark} />
                  ))}
                </View>
                {country === 'KR' && plants.length > 0 && (
                  <Text style={[styles.krDisclaimer, isDark && styles.textMuted]}>
                    {t('weekly.krPollenDisclaimer')}
                  </Text>
                )}
              </View>
            )}

            {/* Tip box */}
            <View style={[styles.tipBox, isDark && styles.tipBoxDark]}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={[styles.tipText, isDark && styles.textDark]}>{t(tipKey)}</Text>
            </View>
          </ScrollView>

          <Pressable style={[styles.closeButton, { backgroundColor: overallColor }]} onPress={dismiss}>
            <Text style={styles.closeText}>{t('outfit.close')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  sheetDark: {
    backgroundColor: '#181818',
  },
  handleZone: {
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: -20,
    marginTop: -20,
    paddingTop: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
  },
  handleDark: {
    backgroundColor: '#444',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  textDark: {
    color: '#eee',
  },
  textMuted: {
    color: '#888',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionDark: {
    backgroundColor: '#242424',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#aaa',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  plantRow: {
    marginBottom: 14,
  },
  plantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  plantName: {
    fontSize: 14,
    color: '#666',
  },
  plantLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  plantBarTrack: {
    flexDirection: 'row',
    gap: 4,
  },
  plantBarSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyCell: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  weeklyDayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
  },
  weeklyDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyDotNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  legendDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e8e8e8',
    marginVertical: 12,
  },
  legendDividerDark: {
    backgroundColor: '#333',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 9,
    color: '#888',
    textAlign: 'center',
  },
  krDisclaimer: {
    marginTop: 10,
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  tipBoxDark: {
    backgroundColor: '#242424',
  },
  tipIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
