import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

interface InfoCardProps {
  type: 'uv' | 'pm25' | 'humidity'
  value: string
  label: string
  level: 'low' | 'medium' | 'high'
  onPress?: () => void
}

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

export function InfoCard({ type, value, label, level, onPress }: InfoCardProps) {
  const { isDark } = useTheme()

  return (
    <Pressable
      style={({ pressed }) => [styles.card, isDark && styles.cardDark, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={[styles.infoIcon, isDark && styles.infoIconDark]}>ⓘ</Text>
      <Text style={styles.icon}>{ICONS[type]}</Text>
      <Text style={[styles.value, { color: LEVEL_COLORS[level] }]}>{value}</Text>
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#999',
  },
  labelDark: {
    color: '#777',
  },
  pressed: {
    opacity: 0.7,
  },
  infoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 12,
    color: '#ccc',
  },
  infoIconDark: {
    color: '#555',
  },
})
