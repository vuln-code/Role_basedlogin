import { APP_ROLES, type AppRole, type Profile } from '../types'

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && APP_ROLES.includes(value as AppRole)
}

export function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== 'object') return false

  const profile = value as Partial<Profile>
  return (
    typeof profile.id === 'string' &&
    typeof profile.full_name === 'string' &&
    typeof profile.email === 'string' &&
    isAppRole(profile.role) &&
    (profile.manager_id === null || typeof profile.manager_id === 'string') &&
    typeof profile.created_at === 'string'
  )
}

export function countProfilesByRole(profiles: Profile[]) {
  return profiles.reduce(
    (counts, profile) => {
      counts.total += 1
      counts[profile.role] += 1
      return counts
    },
    { total: 0, ADMIN: 0, MANAGER: 0, USER: 0 },
  )
}

export function filterProfiles(
  profiles: Profile[],
  searchTerm: string,
  role: AppRole | 'ALL' = 'ALL',
) {
  const query = searchTerm.trim().toLocaleLowerCase()

  return profiles.filter((profile) => {
    const matchesRole = role === 'ALL' || profile.role === role
    const matchesQuery =
      !query ||
      profile.full_name.toLocaleLowerCase().includes(query) ||
      profile.email.toLocaleLowerCase().includes(query)

    return matchesRole && matchesQuery
  })
}

export function formatAccountDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unavailable'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
