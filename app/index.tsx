import { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import Colors from '@/constants/Colors'

// welcome/landing screen
export default function WelcomeScreen() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // if user already logged in, skip to home
  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)')
    }
  }, [user, loading])

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.emoji}>🏠</Text>
        <Text style={styles.title}>Bachelor Pad</Text>
        <Text style={styles.subtitle}>Find bachelor-friendly PGs, flats & rooms near you</Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>✅</Text>
          <Text style={styles.featureText}>Bachelor-friendly verified listings</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>💬</Text>
          <Text style={styles.featureText}>Chat directly with owners</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📍</Text>
          <Text style={styles.featureText}>Map view to find nearby places</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>⭐</Text>
          <Text style={styles.featureText}>Reviews & ratings from tenants</Text>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupBtn} onPress={() => router.push('/signup')}>
          <Text style={styles.signupBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: 30
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.textLight
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 40
  },
  emoji: { fontSize: 60, marginBottom: 10 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22
  },
  features: { marginBottom: 50, gap: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20 },
  featureText: { fontSize: 15, color: Colors.text },
  buttonSection: { gap: 12 },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  loginBtnText: { color: Colors.textWhite, fontSize: 16, fontWeight: '600' },
  signupBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary
  },
  signupBtnText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
})
