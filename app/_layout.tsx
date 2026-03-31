import { Tabs } from 'expo-router'
import { COLORS } from '../constants'

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.background,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="coach/index"
        options={{ title: 'Coach', tabBarLabel: 'Coach' }}
      />
      <Tabs.Screen
        name="plan/index"
        options={{ title: 'Plan du jour', tabBarLabel: 'Plan' }}
      />
      <Tabs.Screen
        name="sessions/index"
        options={{ title: 'Séances', tabBarLabel: 'Séances' }}
      />
    </Tabs>
  )
}
