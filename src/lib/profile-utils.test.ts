import { describe, expect, it } from 'vitest'
import type { Profile } from '../types'
import { countProfilesByRole, filterProfiles, formatAccountDate, isProfile } from './profile-utils'

const profiles: Profile[] = [
  { id: '1', full_name: 'Asha Admin', email: 'asha@example.com', role: 'ADMIN', manager_id: null, created_at: '2026-01-10T00:00:00.000Z' },
  { id: '2', full_name: 'Manoj Manager', email: 'manoj@example.com', role: 'MANAGER', manager_id: null, created_at: '2026-02-10T00:00:00.000Z' },
  { id: '3', full_name: 'Uma User', email: 'uma@example.com', role: 'USER', manager_id: '2', created_at: '2026-03-10T00:00:00.000Z' },
]

describe('profile utilities', () => {
  it('validates restricted profile roles', () => {
    expect(isProfile(profiles[0])).toBe(true)
    expect(isProfile({ ...profiles[0], role: 'OWNER' })).toBe(false)
  })

  it('counts real rows by role', () => {
    expect(countProfilesByRole(profiles)).toEqual({ total: 3, ADMIN: 1, MANAGER: 1, USER: 1 })
  })

  it('searches names and emails case-insensitively', () => {
    expect(filterProfiles(profiles, 'UMA')).toEqual([profiles[2]])
    expect(filterProfiles(profiles, 'manoj@')).toEqual([profiles[1]])
  })

  it('combines role and search filters', () => {
    expect(filterProfiles(profiles, 'a', 'ADMIN')).toEqual([profiles[0]])
    expect(filterProfiles(profiles, '', 'USER')).toEqual([profiles[2]])
  })

  it('handles invalid account dates safely', () => {
    expect(formatAccountDate('not-a-date')).toBe('Unavailable')
  })
})
