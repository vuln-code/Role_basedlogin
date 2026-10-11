import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { BrandMark } from './BrandMark'

interface FieldErrors {
  email?: string
  password?: string
  form?: string
}

function validateEmail(email: string) {
  if (!email.trim()) return 'Email is required.'
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.'
  return null
}

function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  if (!password) errors.password = 'Password is required.'
  return errors
}

export function Login() {
  const {
    signIn,
    requestPasswordReset,
    notice,
    clearNotice,
  } = useAuth()
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateLogin(email, password)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      await signIn(email, password)
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Sign in could not be completed.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const emailError = validateEmail(email)
    if (emailError) {
      setErrors({ email: emailError })
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      await requestPasswordReset(email)
      setResetSent(true)
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'The reset email could not be requested.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const changeMode = (nextMode: 'login' | 'forgot') => {
    setMode(nextMode)
    setErrors({})
    setResetSent(false)
    clearNotice()
  }

  return (
    <main className="login-page">
      <div className="login-ambient" aria-hidden="true">
        <span className="ambient-one" />
        <span className="ambient-two" />
        <span className="ambient-grid" />
      </div>

      <section className="login-showcase" aria-label="Application overview">
        <BrandMark />
        <div className="showcase-copy">
          <span className="eyebrow"><Sparkles size={14} /> Secure workspace</span>
          <h1>One identity.<br />The right workspace.</h1>
          <p>
            AccessFlow routes every authenticated account to a protected experience built
            for its assigned role.
          </p>
          <div className="role-preview" aria-label="Supported roles">
            {['Admin', 'Manager', 'User'].map((role, index) => (
              <div key={role} className={`role-preview-item role-${index + 1}`}>
                <span>{role.slice(0, 1)}</span>
                <div>
                  <strong>{role}</strong>
                  <small>{index === 0 ? 'System overview' : index === 1 ? 'Team workspace' : 'Personal profile'}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="showcase-security"><ShieldCheck size={16} /> Database-enforced access with PostgreSQL RLS</p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand"><BrandMark /></div>
          <span className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Account recovery'}</span>
          <h2>{mode === 'login' ? 'Sign in to your account' : 'Reset your password'}</h2>
          <p className="login-subtitle">
            {mode === 'login'
              ? 'Use the credentials created for you by the project administrator.'
              : 'Enter your account email. If it exists, Supabase will send a secure recovery link.'}
          </p>

          {notice && mode === 'login' && (
            <div className="form-success" role="status"><MailCheck size={17} /> {notice}</div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} noValidate>
              <EmailField
                email={email}
                error={errors.email}
                disabled={isSubmitting}
                onChange={(value) => {
                  setEmail(value)
                  if (errors.email || errors.form) setErrors({ ...errors, email: undefined, form: undefined })
                  if (notice) clearNotice()
                }}
              />

              <div className="field-group">
                <div className="field-label-row">
                  <label htmlFor="password">Password</label>
                  <button type="button" className="text-link" onClick={() => changeMode('forgot')}>
                    Forgot Password?
                  </button>
                </div>
                <div className={`input-shell password-shell ${errors.password ? 'has-error' : ''}`}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      if (errors.password || errors.form) setErrors({ ...errors, password: undefined, form: undefined })
                    }}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p id="password-error" className="field-error">{errors.password}</p>}
              </div>

              {errors.form && <div className="form-error" role="alert">{errors.form}</div>}

              <button className="primary-button" type="submit" disabled={isSubmitting || !isSupabaseConfigured}>
                {isSubmitting ? <span className="button-spinner" aria-hidden="true" /> : <LockKeyhole size={17} />}
                {isSubmitting ? 'Signing in...' : 'Sign in securely'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} noValidate>
              <EmailField
                email={email}
                error={errors.email}
                disabled={isSubmitting || resetSent}
                onChange={(value) => {
                  setEmail(value)
                  if (errors.email || errors.form) setErrors({})
                }}
              />

              {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
              {resetSent && (
                <div className="form-success" role="status">
                  <MailCheck size={18} />
                  <span>If an account matches that email, a recovery link has been sent. Check your inbox and spam folder.</span>
                </div>
              )}

              {!resetSent && (
                <button className="primary-button" type="submit" disabled={isSubmitting || !isSupabaseConfigured}>
                  {isSubmitting ? <span className="button-spinner" aria-hidden="true" /> : <MailCheck size={17} />}
                  {isSubmitting ? 'Sending...' : 'Send recovery link'}
                </button>
              )}

              <button type="button" className="back-link" onClick={() => changeMode('login')} disabled={isSubmitting}>
                <ArrowLeft size={16} /> Back to sign in
              </button>
            </form>
          )}

          <p className="login-note"><ShieldCheck size={15} /> Your password is handled only by Supabase Auth.</p>
        </div>
      </section>
    </main>
  )
}

function EmailField({
  email,
  error,
  disabled,
  onChange,
}: {
  email: string
  error?: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="field-group">
      <label htmlFor="email">Email address</label>
      <div className={`input-shell ${error ? 'has-error' : ''}`}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'email-error' : undefined}
          disabled={disabled}
        />
      </div>
      {error && <p id="email-error" className="field-error">{error}</p>}
    </div>
  )
}
