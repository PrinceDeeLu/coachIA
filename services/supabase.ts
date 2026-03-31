import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://mehwfugmvplfagnqlshw.supabase.co'   // Remplace par ton URL
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1laHdmdWdtdnBsZmFnbnFsc2h3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk0MzM5MSwiZXhwIjoyMDkwNTE5MzkxfQ.FihhQegNjcLx5ZmXmJ6Nok6CIf0XQ0Fv5nxXaeGfjGkr'                  // Remplace par ta clé anon (pas service_role !)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

/** Récupère le token JWT de l'utilisateur connecté */
export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
