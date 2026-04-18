import { useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

export interface WhatsNewFeature {
  emoji: string
  title: string
  desc: string
}

interface WhatsNewProps {
  version: string
  features: WhatsNewFeature[]
  onClose: () => void
}

export function WhatsNew({ version, features, onClose }: WhatsNewProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const scaleAnim = useRef(new Animated.Value(0.85)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  const handleShow = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
  }

  return (
    <Modal transparent animationType="none" onShow={handleShow}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            isDark && styles.cardDark,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <Text style={styles.versionBadge}>v{version}</Text>
          <Text style={[styles.title, isDark && styles.textDark]}>
            {t('whatsNew.title')}
          </Text>

          <View style={styles.featureList}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, isDark && styles.textDark]}>{f.title}</Text>
                  <Text style={[styles.featureDesc, isDark && styles.textMuted]}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{t('whatsNew.confirm')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  versionBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f87171',
    marginBottom: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureList: {
    gap: 16,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#f87171',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  textDark: {
    color: '#eee',
  },
  textMuted: {
    color: '#999',
  },
})
