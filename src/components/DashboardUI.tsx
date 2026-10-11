import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AppRole, Profile } from '../types'
import { formatAccountDate } from '../lib/profile-utils'

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="page-heading" id="overview">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

export function StatCard({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  note: string
}) {
  return (
    <article className="stat-card">
      <div className="stat-icon"><Icon size={19} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  )
}

export function Panel({
  id,
  title,
  description,
  controls,
  children,
}: {
  id?: string
  title: string
  description?: string
  controls?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="panel" id={id}>
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {controls && <div className="panel-controls">{controls}</div>}
      </header>
      {children}
    </section>
  )
}

export function RoleBadge({ role }: { role: AppRole }) {
  return <span className={`role-badge role-badge-${role.toLocaleLowerCase()}`}>{role}</span>
}

export function ProfileTable({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Full name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id}>
              <td data-label="Full name">
                <span className="table-person">
                  <i>{profile.full_name.charAt(0).toUpperCase()}</i>
                  {profile.full_name}
                </span>
              </td>
              <td data-label="Email">{profile.email}</td>
              <td data-label="Role"><RoleBadge role={profile.role} /></td>
              <td data-label="Created">{formatAccountDate(profile.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">0</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export function InlineError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="inline-error" role="alert">
      <div><strong>Data could not be loaded</strong><p>{message}</p></div>
      <button onClick={retry}>Try again</button>
    </div>
  )
}
