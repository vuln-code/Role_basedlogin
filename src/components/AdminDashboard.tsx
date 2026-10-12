import { ChartNoAxesCombined, Search, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { countProfilesByRole, filterProfiles, isProfile } from '../lib/profile-utils'
import { requireSupabase } from '../lib/supabase'
import type { AppRole, Profile } from '../types'
import {
  EmptyState,
  InlineError,
  PageHeading,
  Panel,
  ProfileTable,
  StatCard,
} from './DashboardUI'
import { DashboardLayout } from './DashboardLayout'
import { DashboardInsight } from './ui/DashboardInsight'

export function AdminDashboard({ profile }: { profile: Profile }) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<AppRole | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDirectory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await requireSupabase()
        .from('profiles')
        .select('id, full_name, email, role, manager_id, created_at')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      if (!Array.isArray(data) || !data.every(isProfile)) {
        throw new Error('The directory returned an unexpected data shape.')
      }
      setProfiles(data)
    } catch {
      setProfiles([])
      setError('The authorized profile directory is unavailable. Confirm the admin role and RLS setup.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDirectory()
  }, [loadDirectory])

  const counts = useMemo(() => countProfilesByRole(profiles), [profiles])
  const filtered = useMemo(() => filterProfiles(profiles, search, role), [profiles, search, role])

  return (
    <DashboardLayout profile={profile}>
      <PageHeading
        eyebrow="Administration overview"
        title={`Good to see you, ${profile.full_name.split(' ')[0]}.`}
        description="A live, read-only view of accounts authorized by the database security policy."
      />

      <section className="stats-grid" aria-label="Account statistics">
        <StatCard label="Total accounts" value={loading ? '—' : counts.total} icon={UsersRound} note="Registered profiles" />
        <StatCard label="Administrators" value={loading ? '—' : counts.ADMIN} icon={ShieldCheck} note="Trusted operators" />
        <StatCard label="Managers" value={loading ? '—' : counts.MANAGER} icon={UsersRound} note="Team workspaces" />
        <StatCard label="Users" value={loading ? '—' : counts.USER} icon={UserRound} note="Personal accounts" />
      </section>

      {!loading && !error && (
        <DashboardInsight
          title="Workspace composition"
          eyebrow="Live account directory"
          value={counts.total}
          description="Accounts visible under your admin policy. Role shares reflect the profiles currently returned by Supabase."
          icon={ChartNoAxesCombined}
          details={[
            { label: 'Administrators', value: String(counts.ADMIN), share: counts.total ? counts.ADMIN / counts.total * 100 : 0 },
            { label: 'Managers', value: String(counts.MANAGER), share: counts.total ? counts.MANAGER / counts.total * 100 : 0 },
            { label: 'Users', value: String(counts.USER), share: counts.total ? counts.USER / counts.total * 100 : 0 },
          ]}
        />
      )}

      <Panel
        id="directory"
        title="User directory"
        description="Search and filter the rows your ADMIN policy permits."
        controls={
          <>
            <label className="search-control">
              <Search size={16} />
              <span className="sr-only">Search users</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" />
            </label>
            <label>
              <span className="sr-only">Filter by role</span>
              <select value={role} onChange={(event) => setRole(event.target.value as AppRole | 'ALL')}>
                <option value="ALL">All roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="USER">User</option>
              </select>
            </label>
          </>
        }
      >
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <InlineError message={error} retry={() => void loadDirectory()} />
        ) : filtered.length ? (
          <ProfileTable profiles={filtered} />
        ) : (
          <EmptyState title="No matching accounts" description="Adjust the search text or role filter." />
        )}
      </Panel>

      <Panel id="security" title="Access model" description="Security is enforced before rows reach this interface.">
        <div className="security-note">
          <ShieldCheck size={22} />
          <div><strong>Read-only administrative access</strong><p>Authenticated browser clients receive SELECT only. Role and manager assignments remain restricted to trusted SQL administration.</p></div>
        </div>
      </Panel>
    </DashboardLayout>
  )
}

function TableSkeleton() {
  return <div className="table-skeleton" aria-label="Loading directory" aria-busy="true">{Array.from({ length: 4 }, (_, index) => <span key={index} />)}</div>
}
