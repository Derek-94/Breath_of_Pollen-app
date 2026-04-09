import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native'
import { type OutfitItem, type PollenLevel, POLLEN_LABELS, getPollenColor } from '@/lib/weather-utils'
import { useTheme } from '@/contexts/ThemeContext'

interface OutfitDetailProps {
  items: OutfitItem[]
  temperature: { high: number; low: number }
  pollenLevel: PollenLevel
  laundryOk: boolean
  onClose: () => void
}

export function OutfitDetail({ items, temperature, pollenLevel, laundryOk, onClose }: OutfitDetailProps) {
  const { isDark } = useTheme()

  return (
    <Modal animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, isDark && styles.sheetDark]}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, isDark && styles.textDark]}>今日のおすすめコーデ</Text>

            <View style={styles.metaRow}>
              <Text style={[styles.meta, isDark && styles.textMuted]}>
                🌡 {temperature.high}° / {temperature.low}°
              </Text>
              <View style={[styles.pollenBadge, { backgroundColor: getPollenColor(pollenLevel) + '20' }]}>
                <Text style={{ color: getPollenColor(pollenLevel), fontSize: 12, fontWeight: '600' }}>
                  花粉: {POLLEN_LABELS[pollenLevel]}
                </Text>
              </View>
            </View>

            {items.map((item) => (
              <View key={item.name} style={[styles.itemRow, isDark && styles.itemRowDark]}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, isDark && styles.textDark]}>{item.name}</Text>
                  {item.reason && (
                    <Text style={[styles.itemReason, isDark && styles.textMuted]}>{item.reason}</Text>
                  )}
                </View>
                <Text style={item.recommended ? styles.recommended : styles.optional}>
                  {item.recommended ? 'おすすめ' : '任意'}
                </Text>
              </View>
            ))}

            <View style={[styles.laundryCard, isDark && styles.itemRowDark]}>
              <Text style={styles.laundryIcon}>{laundryOk ? '👕' : '🏠'}</Text>
              <View>
                <Text style={[styles.laundryTitle, isDark && styles.textDark]}>
                  洗濯物: {laundryOk ? '外干しOK' : '部屋干し推奨'}
                </Text>
                <Text style={[styles.laundryDesc, isDark && styles.textMuted]}>
                  {laundryOk
                    ? '花粉少なめ＆晴れ予報で安心'
                    : '花粉が多いため室内干しがおすすめ'}
                </Text>
              </View>
            </View>
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>閉じる</Text>
          </Pressable>
        </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  sheetDark: {
    backgroundColor: '#1e1e1e',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
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
