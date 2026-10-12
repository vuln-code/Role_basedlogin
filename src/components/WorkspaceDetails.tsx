import { ArrowUpRight, CheckCircle2, Circle, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatAccountDate } from '../lib/profile-utils'
import type { Profile } from '../types'
import { Panel, RoleBadge } from './DashboardUI'

export function RefreshDirectory({ busy, onRefresh }: { busy: boolean; onRefresh: () => void }) {
  return <button type="button" className="workspace-action" disabled={busy} onClick={onRefresh}><RefreshCw size={14} />{busy ? 'Refreshing...' : 'Refresh'}</button>
}

export function RecentProfiles({ profiles, title }: { profiles: Profile[]; title: string }) {
  const recent = [...profiles].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 4)
  return <Panel title={title} description="Account creation dates, newest first.">
    <ul className="workspace-people">
      {recent.map(person => <li key={person.id}>
        <span className="workspace-person-avatar" aria-hidden="true">{person.full_name.trim().charAt(0).toUpperCase() || '?'}</span>
        <div><strong>{person.full_name}</strong><span>{formatAccountDate(person.created_at)}</span></div>
        <RoleBadge role={person.role} />
      </li>)}
    </ul>
    {!recent.length && <p className="workspace-empty">No accounts to show yet.</p>}
  </Panel>
}

export function MemberReadiness({ profile }: { profile: Profile }) {
  const { user } = useAuth()
  const confirmed = Boolean(user?.email_confirmed_at)
  const steps = [
    { title: 'Account created', detail: formatAccountDate(profile.created_at), complete: true },
    { title: 'Email confirmed', detail: confirmed ? 'Your email address is confirmed.' : 'Check your inbox for a confirmation email.', complete: confirmed },
    { title: 'Team assignment', detail: profile.manager_id ? 'A manager has been assigned to your account.' : 'Your personal workspace is ready. Contact your administrator if you need a team.', complete: Boolean(profile.manager_id) },
  ]
  return <Panel title="Getting settled" description="Your account setup and next steps.">
    <ol className="workspace-checklist">{steps.map(step => <li key={step.title}>
      {step.complete ? <CheckCircle2 size={19} /> : <Circle size={19} />}
      <div><strong>{step.title}</strong><p>{step.detail}</p></div>
    </li>)}</ol>
    <div className="workspace-footnote">Latest sign-in: {user?.last_sign_in_at ? formatAccountDate(user.last_sign_in_at) : 'Unavailable'}</div>
  </Panel>
}

export function AssignmentReview({ count, active, onToggle }: { count: number; active: boolean; onToggle: () => void }) {
  return <section className="assignment-review" aria-label="Team assignment review">
    <div><span className="workspace-caption">Team assignments</span><h2>{count === 0 ? 'No unassigned members.' : `${count} ${count === 1 ? 'member is' : 'members are'} waiting for a team.`}</h2><p>Review unassigned members before arranging their manager access.</p></div>
    <button className="workspace-action" onClick={onToggle} aria-pressed={active}>{active ? 'Show all accounts' : 'Review members'}<ArrowUpRight size={16} /></button>
  </section>
}
