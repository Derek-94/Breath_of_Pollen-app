import { Tabs } from 'expo-router'
import { Platform, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

function TabLabel({ children, color }: { children: string; color: string }) {
  return (
    <Text allowFontScaling={false} style={{ fontSize: 10, color, marginTop: 2, marginBottom: 2 }}>
      {children}
    </Text>
  )
}

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
        tabBarIconStyle: { marginBottom: 2 },
        tabBarLabelStyle: { marginTop: 2 },
        tabBarStyle: {
          backgroundColor: isDark
            ? Platform.OS === 'android' ? '#252525' : '#1a1a1a'
            : '#fff',
          borderTopColor: isDark
            ? Platform.OS === 'android' ? '#3a3a3a' : '#333'
            : Platform.OS === 'android' ? '#ddd' : '#eee',
          borderTopWidth: Platform.OS === 'android' ? 1 : StyleSheet.hairlineWidth,
          shadowColor: 'transparent',
          elevation: 0,
          paddingTop: Platform.OS === 'ios' ? 6 : 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : androidBottomPadding,
          height: Platform.OS === 'ios' ? 76 : 56 + insets.bottom,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color }) => <TabIcon name="sun-o" color={color} />,
          tabBarLabel: ({ color }) => <TabLabel color={color}>{t('tabs.today')}</TabLabel>,
        }}
      />
      <Tabs.Screen
        name="weekly"
        options={{
          title: t('tabs.weekly'),
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
          tabBarLabel: ({ color }) => <TabLabel color={color}>{t('tabs.weekly')}</TabLabel>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <TabIcon name="gear" color={color} />,
          tabBarLabel: ({ color }) => <TabLabel color={color}>{t('tabs.settings')}</TabLabel>,
        }}
      />
    </Tabs>
  )
}
