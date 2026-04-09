import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WeeklyScreen() {
  const isDark = useColorScheme() === 'dark'

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.text, isDark && styles.textDark]}>週間予報 (coming soon)</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8' },
  containerDark: { backgroundColor: '#111' },
  text: { fontSize: 16, color: '#666' },
  textDark: { color: '#999' },
})
