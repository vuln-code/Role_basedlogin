import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  hasPasswordRecoveryToken,
  isPasswordRecoveryLocation,
} from './password-reset'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

// Captured before createClient asynchronously consumes auth parameters from the URL.
export const hadRecoveryLocationAtStartup =
  typeof window !== 'undefined' && isPasswordRecoveryLocation(window.location)
export const hadRecoveryTokenAtStartup =
  typeof window !== 'undefined' && hasPasswordRecoveryToken(window.location)

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabasePublishableKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabasePublishableKey.includes('your-publishable'),
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  return supabase
}
