import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { BrandMark } from './BrandMark'

export function ProfileError({ message }: { message: string }) {
  const { retryProfile, signOut } = useAuth()
  const [busy, setBusy] = useState<'retry' | 'logout' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const run = async (action: 'retry' | 'logout') => {
    setBusy(action)
    setActionError(null)
    try {
      if (action === 'retry') await retryProfile()
      else await signOut()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The action could not be completed.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="setup-page">
      <section className="setup-card error-card">
        <BrandMark />
        <AlertTriangle className="error-icon" size={32} />
        <h1>Profile access needs attention</h1>
        <p>{message}</p>
        {actionError && <div className="form-error" role="alert">{actionError}</div>}
        <div className="error-actions">
          <button className="primary-button" onClick={() => void run('retry')} disabled={Boolean(busy)}><RefreshCw size={17} /> {busy === 'retry' ? 'Retrying…' : 'Retry'}</button>
          <button className="secondary-button" onClick={() => void run('logout')} disabled={Boolean(busy)}><LogOut size={17} /> {busy === 'logout' ? 'Signing out…' : 'Sign out'}</button>
        </div>
      </section>
    </main>
  )
}
