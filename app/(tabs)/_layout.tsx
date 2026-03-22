import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import AppColors from '@/constants/Colors'

// bottom tab navigation
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textLight,
        tabBarStyle: {
          backgroundColor: AppColors.card,
          borderTopColor: AppColors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 5
        }
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>
      }} />
      <Tabs.Screen name="map" options={{
        title: 'Map',
        tabBarIcon: () => <Text style={{ fontSize: 22 }}>📍</Text>
      }} />
      <Tabs.Screen name="messages" options={{
        title: 'Messages',
        tabBarIcon: () => <Text style={{ fontSize: 22 }}>💬</Text>
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: () => <Text style={{ fontSize: 22 }}>👤</Text>
      }} />
    </Tabs>
  )
}
