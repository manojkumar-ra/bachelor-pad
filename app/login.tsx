import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/config/firebase'
import Colors from '@/constants/Colors'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.replace('/(tabs)')
    } catch (err: any) {
      // show proper error messages
      let msg = 'Something went wrong'
      if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password'
      else if (err.code === 'auth/user-not-found') msg = 'No account found with this email'
      else if (err.code === 'auth/wrong-password') msg = 'Wrong password'
      Alert.alert('Login Failed', msg)
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>🔑</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to find your perfect pad</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.textLight}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={Colors.textLight}
          />
          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  emoji: { fontSize: 50, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textLight, textAlign: 'center', marginBottom: 30, marginTop: 5 },
  form: { gap: 14, marginBottom: 20 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.text
  },
  btn: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.textWhite, fontSize: 16, fontWeight: '600' },
  linkText: { textAlign: 'center', color: Colors.textLight, fontSize: 14 },
  linkBold: { color: Colors.primary, fontWeight: '600' },
})
