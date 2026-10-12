export interface LocationLike {
  pathname: string
  search: string
  hash: string
}

export function isPasswordRecoveryRoute(location: LocationLike) {
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/'
  return normalizedPath === '/reset-password'
}

export function hasPasswordRecoveryToken(location: LocationLike) {
  const search = new URLSearchParams(location.search)
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''))

  return (
    search.get('type') === 'recovery' ||
    hash.get('type') === 'recovery'
  )
}

export function isPasswordRecoveryLocation(location: LocationLike) {
  return isPasswordRecoveryRoute(location) || hasPasswordRecoveryToken(location)
}

export function getPasswordResetRedirect(origin: string) {
  return new URL('/reset-password', origin).toString()
}

export function validateNewPassword(password: string, confirmation: string) {
  if (!password) return 'Enter a new password.'
  if (password.length < 8) return 'Use at least 8 characters.'
  if (password.length > 72) return 'Use no more than 72 characters.'
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Include at least one number.'
  if (!/[^A-Za-z0-9\s]/.test(password)) return 'Include at least one symbol.'
  if (password !== confirmation) return 'The passwords do not match.'
  return null
}
