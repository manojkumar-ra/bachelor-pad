import { Stack } from 'expo-router'
import { AuthProvider } from '@/context/AuthContext'
import { StatusBar } from 'expo-status-bar'

// root layout - wraps everything with auth provider
export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="property/[id]" options={{ headerShown: true, headerTitle: 'Property Details' }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: true, headerTitle: 'Chat' }} />
        <Stack.Screen name="add-listing" options={{ headerShown: true, headerTitle: 'Add Listing' }} />
      </Stack>
    </AuthProvider>
  )
}
