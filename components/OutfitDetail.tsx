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
  Platform,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native'
import { useRef, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { type OutfitItem, type PollenLevel, type LaundryStatus, POLLEN_LABEL_KEYS, getPollenColor } from '@/lib/weather-utils'
import { useTheme } from '@/contexts/ThemeContext'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_MAX = SCREEN_HEIGHT * 0.8
const DISMISS_THRESHOLD = 120

interface OutfitDetailProps {
  items: OutfitItem[]
  temperature: { high: number; low: number }
  pollenLevel: PollenLevel
  isOffSeason?: boolean
  laundryStatus: LaundryStatus
  onClose: () => void
}

export function OutfitDetail({ items, temperature, pollenLevel, isOffSeason, laundryStatus, onClose }: OutfitDetailProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(SHEET_MAX)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 25,
        stiffness: 200,
        useNativeDriver: true,
      }),
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
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_MAX,
        duration: 300,
        useNativeDriver: true,
      }),
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
        if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.5) {
          dismissRef.current()
        } else {
          Animated.parallel([
            Animated.spring(sheetTranslateY, {
              toValue: 0,
              damping: 40,
              stiffness: 300,
              overshootClamping: true,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start()
        }
      },
    })
  ).current

  return (
    <Modal animationType="none" transparent statusBarTranslucent hardwareAccelerated>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents="none" />
        <Pressable style={styles.backdropTouch} onPress={dismiss} />

        <Animated.View
          collapsable={false}
          style={[
            styles.sheet,
            isDark && styles.sheetDark,
            { transform: [{ translateY: sheetTranslateY }], paddingBottom: Platform.OS === 'android' ? insets.bottom + 20 : 20 },
          ]}
        >
          <View style={styles.handleZone} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, isDark && styles.textDark]}>{t('outfit.detailTitle')}</Text>

            <View style={styles.metaRow}>
              <Text style={[styles.meta, isDark && styles.textMuted]}>
                🌡 {temperature.high}° / {temperature.low}°
              </Text>
              {isOffSeason ? (
                <View style={[styles.pollenBadge, { backgroundColor: '#88888820' }]}>
                  <Text style={{ color: '#888', fontSize: 12, fontWeight: '600' }}>
                    {t('outfit.pollenLabel', { level: t('pollen.offSeasonShort') })}
                  </Text>
                </View>
              ) : (
                <View style={[styles.pollenBadge, { backgroundColor: getPollenColor(pollenLevel) + '20' }]}>
                  <Text style={{ color: getPollenColor(pollenLevel), fontSize: 12, fontWeight: '600' }}>
                    {t('outfit.pollenLabel', { level: t(POLLEN_LABEL_KEYS[pollenLevel]) })}
                  </Text>
                </View>
              )}
            </View>

            {items.map((item) => (
              <View key={item.name} style={[styles.itemRow, isDark && styles.itemRowDark]}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, isDark && styles.textDark]}>{t(item.name)}</Text>
                  {item.reason && (
                    <Text style={[styles.itemReason, isDark && styles.textMuted]}>{t(item.reason)}</Text>
                  )}
                </View>
                <Text style={item.recommended ? styles.recommended : styles.optional}>
                  {item.recommended ? t('outfit.recommended') : t('outfit.optional')}
                </Text>
              </View>
            ))}

            <View style={[styles.laundryCard, isDark && styles.laundryCardDark]}>
              <Text style={styles.laundryIcon}>{laundryStatus === 'ok' ? '👕' : '🏠'}</Text>
              <View>
                <Text style={[styles.laundryTitle, isDark && styles.textDark]}>
                  {t('laundry.label', { status: t(laundryStatus === 'ok' ? 'laundry.ok' : 'laundry.indoor') })}
                </Text>
                <Text style={[styles.laundryDesc, isDark && styles.textMuted]}>
                  {t(
                    laundryStatus === 'ok' ? 'laundry.okDesc' :
                    laundryStatus === 'pollen' ? 'laundry.indoorDesc' :
                    laundryStatus === 'rain' ? 'laundry.rainDesc' :
                    'laundry.bothDesc'
                  )}
                </Text>
              </View>
            </View>
          </ScrollView>

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
    maxHeight: '80%',
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  textDark: {
    color: '#eee',
  },
  textMuted: {
    color: '#999',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  meta: {
    fontSize: 14,
    color: '#666',
  },
  pollenBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    gap: 12,
  },
  itemRowDark: {
    borderBottomColor: '#333',
  },
  itemIcon: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  itemReason: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  recommended: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f87171',
  },
  optional: {
    fontSize: 12,
    color: '#aaa',
  },
  laundryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  laundryCardDark: {
    backgroundColor: '#2a2a2a',
  },
  laundryIcon: {
    fontSize: 28,
  },
  laundryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  laundryDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  closeButton: {
    marginTop: 16,
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
