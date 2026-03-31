import { useEffect, useState } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import { supabase } from '../services/supabase'
import { COLORS } from '../constants'

export default function Index() {
  const [session, setSession] = useState<any>(undefined)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Afficher le splash pendant 2 secondes
    const splashTimer = setTimeout(() => setShowSplash(false), 2000)
    
    // Vérifier la session
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    return () => clearTimeout(splashTimer)
  }, [])

  // Afficher le splash screen
  if (showSplash) {
    return (
      <View style={s.splashContainer}>
        <Image 
          source={{ uri: 'https://www.hebergeur-image.fr/uploads/20260331/9c21dda9466d69afcd17b45454792096e8126ad7.png' }} 
          style={s.splashImage}
          resizeMode="contain"
        />
      </View>
    )
  }

  // Attendre que la session soit chargée
  if (session === undefined) return null
  
  // Redirection selon l'état de connexion
  return session ? <Redirect href="/coach" /> : <Redirect href="/login" />
}

const s = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: '80%',
    height: '80%',
  },
})