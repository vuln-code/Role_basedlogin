import { Mail, Search, UserRound, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { filterProfiles, isProfile } from '../lib/profile-utils'
import { requireSupabase } from '../lib/supabase'
import type { Profile } from '../types'
import {
  EmptyState,
  InlineError,
  PageHeading,
  Panel,
  ProfileTable,
  RoleBadge,
  StatCard,
} from './DashboardUI'
import { DashboardLayout } from './DashboardLayout'
import { DashboardInsight } from './ui/DashboardInsight'
import { RecentProfiles, RefreshDirectory } from './WorkspaceDetails'

export function ManagerDashboard({ profile }: { profile: Profile }) {
  const [members, setMembers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await requireSupabase()
        .from('profiles')
        .select('id, full_name, email, role, manager_id, created_at')
        .eq('manager_id', profile.id)
        .order('full_name')

      if (queryError) throw queryError
      if (!Array.isArray(data) || !data.every(isProfile)) throw new Error('Invalid member data.')
      setMembers(data)
    } catch {
      setMembers([])
      setError('Assigned members could not be loaded. Confirm the manager assignment and RLS policy.')
    } finally {
      setLoading(false)
    }
  }, [profile.id])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  const filteredMembers = useMemo(() => filterProfiles(members, search), [members, search])

  return (
    <DashboardLayout profile={profile}>
      <PageHeading
        eyebrow="Team workspace"
        title={`Welcome, ${profile.full_name.split(' ')[0]}.`}
        description="Your people, in one place. Find member details and stay on top of your assigned team."
      />

      <section className="stats-grid manager-stats" aria-label="Team statistics">
        <StatCard label="Assigned members" value={loading ? '—' : members.length} icon={UsersRound} note="RLS-authorized team" />
        <StatCard label="Workspace role" value="MANAGER" icon={UserRound} note="Read-only access" />
      </section>

      {!loading && !error && (
        <DashboardInsight
          title="Your team at a glance"
          eyebrow="Assigned members"
          value={members.length}
          description="Only people assigned to your account are included here."
          icon={UsersRound}
          details={[
            { label: 'Members shown', value: String(filteredMembers.length), share: members.length ? filteredMembers.length / members.length * 100 : 0 },
            { label: 'Search', value: search.trim() ? 'Filtered' : 'Showing all' },
            { label: 'Access', value: 'Read only' },
          ]}
        />
      )}

      {!loading && !error && <RecentProfiles profiles={members} title="Recently created member accounts" />}

      <Panel
        id="team"
        title="Assigned team"
        description="Find people within your assigned team."
        controls={
          <><RefreshDirectory busy={loading} onRefresh={() => void loadMembers()} /><label className="search-control">
            <Search size={16} />
            <span className="sr-only">Search team members</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search team" />
          </label></>
        }
      >
        {loading ? (
          <div className="table-skeleton" aria-label="Loading team" aria-busy="true">{Array.from({ length: 3 }, (_, index) => <span key={index} />)}</div>
        ) : error ? (
          <InlineError message={error} retry={() => void loadMembers()} />
        ) : filteredMembers.length ? (
          <ProfileTable profiles={filteredMembers} />
        ) : members.length ? (
          <EmptyState title="No matching members" description="Try a different name or email address." />
        ) : (
          <EmptyState title="No team members assigned yet" description="A trusted administrator can assign users with manager_id in Supabase." />
        )}
      </Panel>

      <Panel id="profile" title="Manager profile" description="Your authenticated account information.">
        <div className="profile-summary">
          <div className="profile-avatar">{profile.full_name.charAt(0).toUpperCase()}</div>
          <div><h3>{profile.full_name}</h3><p><Mail size={15} /> {profile.email}</p></div>
          <RoleBadge role={profile.role} />
        </div>
      </Panel>
    </DashboardLayout>
  )
}
