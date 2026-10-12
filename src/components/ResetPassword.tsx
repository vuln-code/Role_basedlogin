import { ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { validateNewPassword } from '../lib/password-reset'
import { BrandMark } from './BrandMark'

export function ResetPassword() {
  const {
    recoveryError,
    updateRecoveredPassword,
    leaveRecovery,
  } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || recoveryError) return

    const validationError = validateNewPassword(password, confirmation)
    if (validationError) {
      setFieldError(validationError)
      return
    }

    setFieldError(null)
    setFormError(null)
    setIsSubmitting(true)
    try {
      await updateRecoveredPassword(password)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'The password could not be updated.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const returnToLogin = async () => {
    setFormError(null)
    try {
      await leaveRecovery()
    } catch {
      setFormError('The recovery session could not be closed. Refresh the page and try again.')
    }
  }

  return (
    <main className="login-page reset-page">
      <div className="login-ambient" aria-hidden="true">
        <span className="ambient-one" />
        <span className="ambient-two" />
        <span className="ambient-grid" />
      </div>

      <section className="login-showcase" aria-label="Password recovery security">
        <BrandMark />
        <div className="showcase-copy reset-showcase-copy">
          <span className="eyebrow"><Sparkles size={14} /> Verified recovery</span>
          <h1>Choose a fresh password.</h1>
          <p>
            The recovery link creates a temporary authenticated session. Your new password
            is sent directly to Supabase Auth and is never stored by AccessFlow.
          </p>
          <div className="recovery-security-list">
            <span><ShieldCheck size={17} /> Recovery session required</span>
            <span><ShieldCheck size={17} /> Minimum 8 characters</span>
            <span><ShieldCheck size={17} /> Session closed after update</span>
          </div>
        </div>
        <p className="showcase-security"><ShieldCheck size={16} /> Secure password replacement</p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand"><BrandMark /></div>
          <span className="eyebrow">Password recovery</span>
          <h2>Set a new password</h2>
          <p className="login-subtitle">
            Enter the new password twice. This form works only while the recovery session is valid.
          </p>

          {recoveryError ? (
            <div className="recovery-invalid" role="alert">
              <KeyRound size={22} />
              <div><strong>Recovery link unavailable</strong><p>{recoveryError}</p></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <PasswordField
                id="new-password"
                label="New password"
                value={password}
                visible={showPasswords}
                disabled={isSubmitting}
                describedBy={fieldError ? 'new-password-error' : 'password-guidance'}
                onChange={(value) => {
                  setPassword(value)
                  setFieldError(null)
                  setFormError(null)
                }}
                onToggle={() => setShowPasswords((visible) => !visible)}
              />
              <p id="password-guidance" className="password-guidance">Use 8–72 characters with an uppercase letter, lowercase letter, number, and symbol. Avoid a previously used password.</p>

              <PasswordField
                id="confirm-password"
                label="Confirm new password"
                value={confirmation}
                visible={showPasswords}
                disabled={isSubmitting}
                describedBy={fieldError ? 'new-password-error' : undefined}
                onChange={(value) => {
                  setConfirmation(value)
                  setFieldError(null)
                  setFormError(null)
                }}
                onToggle={() => setShowPasswords((visible) => !visible)}
              />

              {fieldError && <p id="new-password-error" className="field-error recovery-field-error">{fieldError}</p>}
              {formError && <div className="form-error" role="alert">{formError}</div>}

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <span className="button-spinner" aria-hidden="true" /> : <KeyRound size={17} />}
                {isSubmitting ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          )}

          <button type="button" className="back-link" onClick={() => void returnToLogin()} disabled={isSubmitting}>
            <ArrowLeft size={16} /> Return to sign in
          </button>
          {recoveryError && formError && <div className="form-error" role="alert">{formError}</div>}
        </div>
      </section>
    </main>
  )
}

function PasswordField({
  id,
  label,
  value,
  visible,
  disabled,
  describedBy,
  onChange,
  onToggle,
}: {
  id: string
  label: string
  value: string
  visible: boolean
  disabled: boolean
  describedBy?: string
  onChange: (value: string) => void
  onToggle: () => void
}) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-shell password-shell">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={describedBy}
          disabled={disabled}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={onToggle}
          aria-label={visible ? 'Hide passwords' : 'Show passwords'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}
