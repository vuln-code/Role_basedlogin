import { CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { formatAccountDate } from '../lib/profile-utils'
import type { Profile } from '../types'
import { DashboardLayout } from './DashboardLayout'
import { PageHeading, Panel, RoleBadge, StatCard } from './DashboardUI'
import { DashboardInsight } from './ui/DashboardInsight'

export function UserDashboard({ profile }: { profile: Profile }) {
  return (
    <DashboardLayout profile={profile}>
      <PageHeading
        eyebrow="Personal workspace"
        title={`Welcome, ${profile.full_name.split(' ')[0]}.`}
        description="Your private account view contains only the profile authorized for this session."
      />

      <section className="stats-grid user-stats" aria-label="Account overview">
        <StatCard label="Account status" value="Active" icon={ShieldCheck} note="Authenticated session" />
        <StatCard label="Application role" value="USER" icon={UserRound} note="Personal access" />
      </section>

      <DashboardInsight
        title="Your account"
        eyebrow="Personal workspace"
        value={profile.full_name}
        description="A quick view of the profile attached to your signed-in account."
        icon={UserRound}
        details={[
          { label: 'Email', value: profile.email },
          { label: 'Role', value: profile.role },
          { label: 'Member since', value: formatAccountDate(profile.created_at) },
        ]}
      />

      <Panel id="profile" title="My profile" description="Information stored in your protected profile record.">
        <div className="personal-profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar large">{profile.full_name.charAt(0).toUpperCase()}</div>
            <div><h3>{profile.full_name}</h3><RoleBadge role={profile.role} /></div>
          </div>
          <dl>
            <div><dt><Mail size={16} /> Email address</dt><dd>{profile.email}</dd></div>
            <div><dt><UserRound size={16} /> Application role</dt><dd>{profile.role}</dd></div>
            <div><dt><CalendarDays size={16} /> Account created</dt><dd>{formatAccountDate(profile.created_at)}</dd></div>
          </dl>
        </div>
      </Panel>

      <Panel id="security" title="Access details" description="What this account is permitted to view.">
        <div className="security-note">
          <ShieldCheck size={22} />
          <div><strong>Your data stays scoped to you</strong><p>Row Level Security allows this session to select its own profile and denies access to every unrelated account.</p></div>
        </div>
      </Panel>
    </DashboardLayout>
  )
}
