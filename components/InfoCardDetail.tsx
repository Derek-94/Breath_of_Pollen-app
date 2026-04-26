import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native'
import { useRef, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_MAX = SCREEN_HEIGHT * 0.6

const ICONS: Record<string, string> = {
  uv: '☀️',
  pm25: '💨',
  humidity: '💧',
}

const LEVEL_COLORS: Record<string, string> = {
  low: '#4ade80',
  medium: '#facc15',
  high: '#f87171',
}

const UNITS: Record<string, string> = {
  uv: '',
  pm25: ' μg/m³',
  humidity: '%',
}

interface InfoCardDetailProps {
  type: 'uv' | 'pm25' | 'humidity'
  level: 'low' | 'medium' | 'high'
  numericValue: number | null
  onClose: () => void
}

export function InfoCardDetail({ type, level, numericValue, onClose }: InfoCardDetailProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const backdropOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(SHEET_MAX)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(sheetTranslateY, { toValue: 0, damping: 25, stiffness: 200, useNativeDriver: false }),
    ]).start()
  }, [])

  const isDismissing = useRef(false)
  const dismissRef = useRef<() => void>(null as unknown as () => void)

  const dismiss = () => {
    if (isDismissing.current) return
    isDismissing.current = true
    sheetTranslateY.stopAnimation()
    backdropOpacity.stopAnimation()
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: SHEET_MAX, duration: 300, useNativeDriver: false }),
    ]).start(() => onClose())
  }

  dismissRef.current = dismiss

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.dy > 0) {
          sheetTranslateY.setValue(gs.dy)
          backdropOpacity.setValue(1 - gs.dy / SHEET_MAX)
        }
      },
      onPanResponderRelease: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.dy > 100 || gs.vy > 0.5) {
          dismissRef.current()
        } else {
          Animated.parallel([
            Animated.spring(sheetTranslateY, { toValue: 0, damping: 40, stiffness: 300, overshootClamping: true, useNativeDriver: false }),
            Animated.timing(backdropOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
          ]).start()
        }
      },
    })
  ).current

  const descKey = `infoDetail.${type}.${level}.desc` as const
  const tipKey = `infoDetail.${type}.${level}.tip` as const
  const titleKey = `infoDetail.${type}.title` as const

  const levelColor = LEVEL_COLORS[level]
  const levelLabelKey = type === 'uv'
    ? `uv.${level === 'low' ? 'low' : level === 'medium' ? 'medium' : 'high'}`
    : type === 'pm25'
    ? `pm25.${level === 'low' ? 'good' : level === 'medium' ? 'moderate' : 'bad'}`
    : `uv.${level === 'low' ? 'low' : level === 'medium' ? 'medium' : 'high'}`

  return (
    <Modal animationType="none" transparent statusBarTranslucent hardwareAccelerated>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents="none" />
        <Pressable style={styles.backdropTouch} onPress={dismiss} />

        <Animated.View
          collapsable={false}
          style={[styles.sheet, isDark && styles.sheetDark, { transform: [{ translateY: sheetTranslateY }], paddingBottom: Platform.OS === 'android' ? insets.bottom + 20 : 20 }]}
        >
          <View style={styles.handleZone} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>{ICONS[type]}</Text>
            <Text style={[styles.title, isDark && styles.textDark]}>{t(titleKey)}</Text>
          </View>

          {/* Value */}
          {numericValue !== null && (
            <Text style={[styles.numericValue, { color: levelColor }]}>
              {numericValue}{UNITS[type]}
            </Text>
          )}

          {/* Level badge */}
          <View style={[styles.levelBadge, { backgroundColor: levelColor + '25' }]}>
            <Text style={[styles.levelText, { color: levelColor }]}>
              {type === 'pm25'
                ? t(`pm25.${level === 'low' ? 'good' : level === 'medium' ? 'moderate' : 'bad'}`)
                : t(`uv.${level}`)}
            </Text>
          </View>

          {/* Description */}
          <Text style={[styles.desc, isDark && styles.textMuted]}>{t(descKey)}</Text>

          {/* Tip box */}
          <View style={[styles.tipBox, isDark && styles.tipBoxDark]}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={[styles.tipText, isDark && styles.textDark]}>{t(tipKey)}</Text>
          </View>

          <Pressable style={styles.closeButton} onPress={dismiss} android_ripple={null}>
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sheetDark: {
    backgroundColor: '#1e1e1e',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 28,
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
    color: '#999',
  },
  numericValue: {
    fontSize: 48,
    fontWeight: '200',
    marginBottom: 12,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 16,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  desc: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  tipBoxDark: {
    backgroundColor: '#2a2a2a',
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
    backgroundColor: '#f87171',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
