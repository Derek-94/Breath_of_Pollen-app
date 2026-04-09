import { Tabs } from 'expo-router'
import { useColorScheme, Platform } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'

const TINT_LIGHT = '#f87171'
const TINT_DARK = '#fb923c'

function TabIcon({ name, color }: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={22} name={name} color={color} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const tint = colorScheme === 'dark' ? TINT_DARK : TINT_LIGHT

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#888' : '#999',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
          borderTopColor: colorScheme === 'dark' ? '#333' : '#eee',
          paddingBottom: Platform.OS === 'ios' ? 16 : 8,
          height: Platform.OS === 'ios' ? 68 : 56,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '今日',
          tabBarIcon: ({ color }) => <TabIcon name="sun-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="weekly"
        options={{
          title: '週間',
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color }) => <TabIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  )
}
