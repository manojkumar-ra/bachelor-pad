import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import Colors from '@/constants/Colors'

export default function SignupScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    // validate fields
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      // set the display name
      await updateProfile(result.user, { displayName: name })

      // save extra user info to firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        name: name,
        email: email,
        phone: phone,
        isOwner: isOwner,
        favorites: [],
        createdAt: new Date().toISOString()
      })

      router.replace('/(tabs)')
    } catch (err: any) {
      let msg = 'Something went wrong'
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered'
      else if (err.code === 'auth/weak-password') msg = 'Password is too weak'
      else if (err.code === 'auth/invalid-email') msg = 'Invalid email address'
      Alert.alert('Signup Failed', msg)
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>📝</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join and find your bachelor pad</Text>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Full Name *" value={name} onChangeText={setName} placeholderTextColor={Colors.textLight} />
          <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.textLight} />
          <TextInput style={styles.input} placeholder="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={Colors.textLight} />
          <TextInput style={styles.input} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={Colors.textLight} />

          {/* checkbox for owner */}
          <TouchableOpacity style={styles.toggleRow} onPress={() => setIsOwner(!isOwner)}>
            <View style={[styles.checkbox, isOwner && styles.checkboxChecked]}>
              {isOwner && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.toggleText}>I'm a property owner / landlord</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSignup} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
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
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 14, fontSize: 15, color: Colors.text
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  checkbox: {
    width: 22, height: 22, borderRadius: 5,
    borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center'
  },
  checkboxChecked: { backgroundColor: Colors.primary },
  checkmark: { color: Colors.textWhite, fontSize: 14, fontWeight: 'bold' },
  toggleText: { fontSize: 14, color: Colors.text },
  btn: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.textWhite, fontSize: 16, fontWeight: '600' },
  linkText: { textAlign: 'center', color: Colors.textLight, fontSize: 14 },
  linkBold: { color: Colors.primary, fontWeight: '600' },
})
