import { AdminDashboard } from './components/AdminDashboard'
import { LoadingScreen } from './components/LoadingScreen'
import { Login } from './components/Login'
import { ManagerDashboard } from './components/ManagerDashboard'
import { ProfileError } from './components/ProfileError'
import { ResetPassword } from './components/ResetPassword'
import { SetupNotice } from './components/SetupNotice'
import { UserDashboard } from './components/UserDashboard'
import { useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'

export default function App() {
  const { status, profile, error } = useAuth()

  if (!isSupabaseConfigured) return <SetupNotice />
  if (status === 'recovery') return <ResetPassword />
  if (status === 'loading') return <LoadingScreen />
  if (status === 'error') return <ProfileError message={error ?? 'The account could not be verified.'} />
  if (status === 'anonymous' || !profile) return <Login />

  switch (profile.role) {
    case 'ADMIN':
      return <AdminDashboard profile={profile} />
    case 'MANAGER':
      return <ManagerDashboard profile={profile} />
    case 'USER':
      return <UserDashboard profile={profile} />
  }
}
