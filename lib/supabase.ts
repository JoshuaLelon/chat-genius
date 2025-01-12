import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
})

// Helper to get the current user's ID
export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

// Helper to get the current session
export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const session = await getCurrentSession()
  return !!session
} 