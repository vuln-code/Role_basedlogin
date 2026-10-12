import { Eye, EyeOff, MailCheck, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { validateNewPassword } from '../lib/password-reset'
import { isSupabaseConfigured } from '../lib/supabase'
import { AnimatedInputShell } from './ui/modern-animated-sign-in'

export function SignupForm({ onBack }: { onBack: () => void }) {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy || sent) return
    const validation = !name.trim() || name.trim().length > 120
      ? 'Enter your full name (1–120 characters).'
      : !/^\S+@\S+\.\S+$/.test(email.trim()) ? 'Enter a valid email address.'
      : validateNewPassword(password, confirm)
    if (validation) { setError(validation); return }
    setError(null)
    setBusy(true)
    try {
      await signUp(name, email, password)
      setPassword('')
      setConfirm('')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration could not be completed.')
    } finally { setBusy(false) }
  }

  return sent ? (
    <div>
      <div className="form-success" role="status"><MailCheck size={20} /><span>Check your inbox for a confirmation link if your address is eligible for registration. Already registered? Sign in or use Forgot Password.</span></div>
      <button className="back-link" onClick={onBack}>Back to sign in</button>
    </div>
  ) : (
    <form onSubmit={submit} noValidate aria-label="Create account" aria-busy={busy}>
      <div className="field-group">
        <label htmlFor="signup-name">Full name</label>
        <AnimatedInputShell><div className="input-shell"><input id="signup-name" name="name" autoComplete="name" maxLength={120} value={name} onChange={e => setName(e.target.value)} disabled={busy} required /></div></AnimatedInputShell>
      </div>
      <div className="field-group">
        <label htmlFor="signup-email">Email address</label>
        <AnimatedInputShell><div className="input-shell"><input id="signup-email" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} disabled={busy} required /></div></AnimatedInputShell>
      </div>
      <div className="field-group">
        <label htmlFor="signup-password">Password</label>
        <AnimatedInputShell><div className="input-shell password-shell">
          <input id="signup-password" name="password" type={visible ? 'text' : 'password'} autoComplete="new-password" aria-describedby="signup-guidance" value={password} onChange={e => setPassword(e.target.value)} disabled={busy} required />
          <button type="button" className="password-toggle" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div></AnimatedInputShell>
        <p id="signup-guidance" className="signup-guidance">Use 8–72 characters. Your account starts with member access.</p>
      </div>
      <div className="field-group">
        <label htmlFor="signup-confirm">Confirm password</label>
        <AnimatedInputShell><div className="input-shell"><input id="signup-confirm" name="confirm-password" type={visible ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} disabled={busy} required /></div></AnimatedInputShell>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="primary-button" type="submit" disabled={busy || !isSupabaseConfigured}>{busy ? <span className="button-spinner" /> : <UserPlus size={17} />}{busy ? 'Creating account...' : 'Create account'}</button>
      <button className="back-link" type="button" disabled={busy} onClick={onBack}>Already registered? Sign in</button>
    </form>
  )
}
