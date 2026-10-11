import {
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { AppRole, Profile } from '../types'
import { BrandMark } from './BrandMark'

interface NavItem {
  label: string
  icon: LucideIcon
  target: string
}

const roleNavigation: Record<AppRole, NavItem[]> = {
  ADMIN: [
    { label: 'Overview', icon: LayoutDashboard, target: 'overview' },
    { label: 'User directory', icon: UsersRound, target: 'directory' },
    { label: 'Access model', icon: Shield, target: 'security' },
  ],
  MANAGER: [
    { label: 'Overview', icon: LayoutDashboard, target: 'overview' },
    { label: 'My team', icon: UsersRound, target: 'team' },
    { label: 'My profile', icon: UserRound, target: 'profile' },
  ],
  USER: [
    { label: 'Overview', icon: LayoutDashboard, target: 'overview' },
    { label: 'My profile', icon: UserRound, target: 'profile' },
    { label: 'Access details', icon: Shield, target: 'security' },
  ],
}

export function DashboardLayout({
  profile,
  children,
}: {
  profile: Profile
  children: ReactNode
}) {
  const { signOut, isSigningOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('overview')
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const navItems = roleNavigation[profile.role]

  const navigate = (target: string) => {
    setActive(target)
    setMobileOpen(false)
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleLogout = async () => {
    setLogoutError(null)
    try {
      await signOut()
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Sign out failed.')
    }
  }

  const sidebar = (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`} aria-label="Dashboard navigation">
      <div className="sidebar-header">
        <BrandMark compact={collapsed} />
        <button className="sidebar-close-mobile" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
          <X size={20} />
        </button>
      </div>

      <div className="identity-card">
        <span className="avatar">{profile.full_name.trim().charAt(0).toUpperCase() || '?'}</span>
        {!collapsed && (
          <div>
            <strong>{profile.full_name}</strong>
            <span className={`role-badge role-badge-${profile.role.toLocaleLowerCase()}`}>{profile.role}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <span className="nav-caption">Workspace</span>}
        {navItems.map((item) => (
          <button
            key={item.target}
            className={active === item.target ? 'active' : ''}
            onClick={() => navigate(item.target)}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {logoutError && !collapsed && <p role="alert">{logoutError}</p>}
        <button className="logout-button" onClick={handleLogout} disabled={isSigningOut} title={collapsed ? 'Log out' : undefined}>
          {isSigningOut ? <span className="button-spinner" /> : <LogOut size={18} />}
          {!collapsed && <span>{isSigningOut ? 'Signing out…' : 'Log out'}</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <div className={`dashboard role-theme-${profile.role.toLocaleLowerCase()}`}>
      <div className={`mobile-overlay ${mobileOpen ? 'is-visible' : ''}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      <div className={`sidebar-mobile-shell ${mobileOpen ? 'is-open' : ''}`}>{sidebar}</div>
      <div className="sidebar-desktop-shell">{sidebar}</div>

      <div className="dashboard-stage">
        <header className="topbar">
          <div>
            <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu size={20} />
            </button>
            <button className="collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <ChevronLeft className={collapsed ? 'rotate-180' : ''} size={18} />
            </button>
            <span className="breadcrumb">Workspace <i>/</i> {profile.role.toLocaleLowerCase()}</span>
          </div>
          <div className="topbar-status"><span /> Protected session</div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  )
}
