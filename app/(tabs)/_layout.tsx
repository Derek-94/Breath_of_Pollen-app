import { Tabs } from 'expo-router'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

const TINT_LIGHT = '#f87171'
const TINT_DARK = '#fb923c'

function TabIcon({ name, color }: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={22} name={name} color={color} />
}

export default function TabLayout() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const tint = isDark ? TINT_DARK : TINT_LIGHT
  const insets = useSafeAreaInsets()
  const androidBottomPadding = Platform.OS === 'android' ? insets.bottom + 8 : 0

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: isDark ? '#888' : '#999',
        tabBarStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
          borderTopColor: isDark ? '#333' : '#eee',
          paddingBottom: Platform.OS === 'ios' ? 16 : androidBottomPadding,
          height: Platform.OS === 'ios' ? 68 : 56 + insets.bottom,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color }) => <TabIcon name="sun-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="weekly"
        options={{
          title: t('tabs.weekly'),
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <TabIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  )
}
