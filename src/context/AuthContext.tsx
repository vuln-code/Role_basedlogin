import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { getPasswordResetRedirect } from '../lib/password-reset'
import { isProfile } from '../lib/profile-utils'
import {
  hadRecoveryLocationAtStartup,
  hadRecoveryTokenAtStartup,
  isSupabaseConfigured,
  requireSupabase,
  supabase,
} from '../lib/supabase'
import type { AuthStatus, Profile } from '../types'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  profile: Profile | null
  error: string | null
  notice: string | null
  recoveryError: string | null
  isSigningOut: boolean
  signIn: (email: string, password: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updateRecoveredPassword: (password: string) => Promise<void>
  leaveRecovery: () => Promise<void>
  clearNotice: () => void
  signOut: () => Promise<void>
  retryProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function friendlyAuthError(message: string) {
  const normalized = message.toLocaleLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'The email or password is incorrect.'
  }
  if (normalized.includes('email not confirmed')) {
    return "Confirm this account's email in Supabase before signing in."
  }
  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return 'Unable to reach the authentication service. Check your connection and try again.'
  }

  return 'Authentication could not be completed. Please try again.'
}

function friendlyProfileError(message: string) {
  const normalized = message.toLocaleLowerCase()
  if (normalized.includes('row') || normalized.includes('json object')) {
    return 'No authorized profile was found for this account. Run the database setup and try again.'
  }
  if (normalized.includes('permission') || normalized.includes('policy')) {
    return 'The profile is unavailable because database access was denied.'
  }
  return 'The account profile could not be loaded safely.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? 'loading' : 'anonymous',
  )
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [recoveryError, setRecoveryError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const requestId = useRef(0)
  const mounted = useRef(true)
  const recoveryMode = useRef(hadRecoveryLocationAtStartup)
  const recoveryVerified = useRef(hadRecoveryTokenAtStartup)

  const cleanRecoveryUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, '/')
    }
  }, [])

  const cleanRecoveryTokens = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, '/reset-password')
    }
  }, [])

  const clearProtectedState = useCallback(() => {
    requestId.current += 1
    setUser(null)
    setProfile(null)
  }, [])

  const enterRecovery = useCallback((session: Session | null, verified = recoveryVerified.current) => {
    recoveryMode.current = true
    requestId.current += 1
    setProfile(null)
    setUser(session?.user ?? null)
    setError(null)
    setRecoveryError(session && verified ? null : 'This password recovery link is invalid or has expired.')
    setStatus('recovery')
    if (session && verified) cleanRecoveryTokens()
  }, [cleanRecoveryTokens])

  const hydrateSession = useCallback(async (session: Session | null) => {
    const currentRequest = ++requestId.current

    if (!session) {
      setUser(null)
      setProfile(null)
      setError(null)
      setStatus('anonymous')
      return
    }

    setStatus('loading')
    setError(null)
    setUser(session.user)

    try {
      const client = requireSupabase()
      const { data, error: profileError } = await client
        .from('profiles')
        .select('id, full_name, email, role, manager_id, created_at')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError
      if (!isProfile(data)) throw new Error('Invalid profile role or shape.')
      if (!mounted.current || currentRequest !== requestId.current) return

      setProfile(data)
      setStatus('authenticated')
    } catch (profileError) {
      if (!mounted.current || currentRequest !== requestId.current) return
      setProfile(null)
      setStatus('error')
      setError(
        friendlyProfileError(
          profileError instanceof Error ? profileError.message : 'Unknown profile error',
        ),
      )
    }
  }, [])

  useEffect(() => {
    mounted.current = true

    if (!supabase) {
      setStatus('anonymous')
      return () => {
        mounted.current = false
      }
    }

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted.current) return
      if (sessionError) {
        clearProtectedState()
        setStatus('error')
        setError('The saved session could not be restored safely.')
        return
      }

      if (recoveryMode.current) {
        enterRecovery(data.session)
        return
      }

      void hydrateSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryVerified.current = true
        enterRecovery(session, true)
        return
      }

      if (event === 'SIGNED_OUT') {
        recoveryMode.current = false
        recoveryVerified.current = false
        setRecoveryError(null)
        cleanRecoveryUrl()
        void hydrateSession(null)
        return
      }

      if (recoveryMode.current) {
        enterRecovery(session)
        return
      }

      void hydrateSession(session)
    })

    return () => {
      mounted.current = false
      requestId.current += 1
      subscription.unsubscribe()
    }
  }, [cleanRecoveryUrl, clearProtectedState, enterRecovery, hydrateSession])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    setNotice(null)
    const client = requireSupabase()
    const { data, error: signInError } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      throw new Error(friendlyAuthError(signInError.message))
    }

    await hydrateSession(data.session)
  }, [hydrateSession])

  const requestPasswordReset = useCallback(async (email: string) => {
    setError(null)
    const client = requireSupabase()
    const { error: resetError } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getPasswordResetRedirect(window.location.origin),
    })

    if (resetError) {
      const normalized = resetError.message.toLocaleLowerCase()
      if (normalized.includes('rate') || normalized.includes('too many')) {
        throw new Error('Too many reset requests. Wait a little and try again.')
      }
      if (normalized.includes('fetch') || normalized.includes('network')) {
        throw new Error('Unable to reach the authentication service. Check your connection.')
      }
      throw new Error('The reset email could not be requested. Please try again.')
    }
  }, [])

  const updateRecoveredPassword = useCallback(async (password: string) => {
    const client = requireSupabase()
    const { data: sessionData } = await client.auth.getSession()

    if (!recoveryMode.current || !recoveryVerified.current || !sessionData.session) {
      setRecoveryError('This password recovery link is invalid or has expired.')
      throw new Error('A valid password recovery session is required.')
    }

    const { error: updateError } = await client.auth.updateUser({ password })
    if (updateError) {
      const normalized = updateError.message.toLocaleLowerCase()
      if (normalized.includes('same password')) {
        throw new Error('Choose a password you have not used for this account.')
      }
      if (normalized.includes('weak') || normalized.includes('character')) {
        throw new Error('This password does not meet the project password policy.')
      }
      throw new Error('The password could not be updated. Request a new recovery link and try again.')
    }

    const { error: signOutError } = await client.auth.signOut()
    if (signOutError) {
      throw new Error('The password changed, but the recovery session could not be closed safely.')
    }

    recoveryMode.current = false
    recoveryVerified.current = false
    setRecoveryError(null)
    clearProtectedState()
    cleanRecoveryUrl()
    setStatus('anonymous')
    setNotice('Password updated successfully. Sign in with your new password.')
  }, [cleanRecoveryUrl, clearProtectedState])

  const leaveRecovery = useCallback(async () => {
    recoveryMode.current = false
    recoveryVerified.current = false
    setRecoveryError(null)
    clearProtectedState()
    cleanRecoveryUrl()

    if (supabase) {
      await supabase.auth.signOut({ scope: 'local' })
    }
    setStatus('anonymous')
  }, [cleanRecoveryUrl, clearProtectedState])

  const clearNotice = useCallback(() => setNotice(null), [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    setIsSigningOut(true)
    setError(null)
    clearProtectedState()

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      const { data } = await supabase.auth.getSession()

      if (signOutError || data.session) {
        if (data.session) await hydrateSession(data.session)
        throw new Error('Sign out could not be confirmed. Please try again.')
      }

      setStatus('anonymous')
    } finally {
      if (mounted.current) setIsSigningOut(false)
    }
  }, [clearProtectedState, hydrateSession])

  const retryProfile = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase.auth.getSession()
    await hydrateSession(data.session)
  }, [hydrateSession])

  const value = useMemo(
    () => ({
      status,
      user,
      profile,
      error,
      notice,
      recoveryError,
      isSigningOut,
      signIn,
      requestPasswordReset,
      updateRecoveredPassword,
      leaveRecovery,
      clearNotice,
      signOut,
      retryProfile,
    }),
    [
      status,
      user,
      profile,
      error,
      notice,
      recoveryError,
      isSigningOut,
      signIn,
      requestPasswordReset,
      updateRecoveredPassword,
      leaveRecovery,
      clearNotice,
      signOut,
      retryProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
