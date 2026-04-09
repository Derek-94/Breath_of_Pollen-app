import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

interface InfoCardProps {
  type: 'uv' | 'pm25' | 'humidity'
  value: string
  label: string
  level: 'low' | 'medium' | 'high'
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

export function InfoCard({ type, value, label, level }: InfoCardProps) {
  const { isDark } = useTheme()

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <Text style={styles.icon}>{ICONS[type]}</Text>
      <Text style={[styles.value, { color: LEVEL_COLORS[level] }]}>{value}</Text>
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
    </View>
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
})
