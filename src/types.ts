export const APP_ROLES = ['ADMIN', 'MANAGER', 'USER'] as const

export type AppRole = (typeof APP_ROLES)[number]

export interface Profile {
  id: string
  full_name: string
  email: string
  role: AppRole
  manager_id: string | null
  created_at: string
}

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'recovery' | 'error'
