import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { supabase } from '../services/supabase'
import { router } from 'expo-router'
import { COLORS, SPACING } from '../constants'

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function login() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.replace('/coach')
    setLoading(false)
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.title}>Repforge</Text>
        <Text style={s.sub}>Ton coach IA sportif</Text>
        <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={s.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <TouchableOpacity style={s.btn} onPress={login} disabled={loading}>
          <Text style={s.btnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SPACING.xl, justifyContent: 'center', gap: SPACING.md },
  title:     { fontSize: 32, fontWeight: '500', color: COLORS.primary, textAlign: 'center' },
  sub:       { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.xl },
  input:     { backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg, fontSize: 15, color: COLORS.text },
  error:     { color: COLORS.danger, fontSize: 13, textAlign: 'center' },
  btn:       { backgroundColor: COLORS.primary, borderRadius: 12, padding: SPACING.lg, alignItems: 'center' },
  btnText:   { color: '#fff', fontWeight: '500', fontSize: 16 },
})