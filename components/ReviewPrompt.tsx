import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { markReviewRequested, requestReview } from '@/lib/review'

const SCREEN_HEIGHT = Dimensions.get('window').height

interface ReviewPromptProps {
  onClose: () => void
}

export function ReviewPrompt({ onClose }: ReviewPromptProps) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 120,
    }).start()
  }, [])

  const dismiss = (cb?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose()
      cb?.()
    })
  }

  const handleConfirm = async () => {
    await markReviewRequested()
    dismiss(() => requestReview())
  }

  const handleDismiss = async () => {
    await markReviewRequested()
    dismiss()
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleDismiss} />
      <Animated.View
        style={[
          styles.sheet,
          isDark && styles.sheetDark,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.handle} />

        <Text style={styles.emoji}>🌿</Text>
        <Text style={[styles.title, isDark && styles.textDark]}>
          {t('review.title')}
        </Text>
        <Text style={[styles.body, isDark && styles.textMuted]}>
          {t('review.body')}
        </Text>

        <Pressable
          style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmText}>{t('review.confirm')}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.dismissButton, pressed && styles.pressed]}
          onPress={handleDismiss}
        >
          <Text style={[styles.dismissText, isDark && styles.textMuted]}>
            {t('review.dismiss')}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  sheetDark: {
    backgroundColor: '#1a1a1a',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  confirmButton: {
    backgroundColor: '#f87171',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dismissButton: {
    paddingVertical: 10,
  },
  dismissText: {
    fontSize: 14,
    color: '#999',
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
