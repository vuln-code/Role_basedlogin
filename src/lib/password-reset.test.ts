import { describe, expect, it } from 'vitest'
import {
  getPasswordResetRedirect,
  hasPasswordRecoveryToken,
  isPasswordRecoveryLocation,
  isPasswordRecoveryRoute,
  validateNewPassword,
} from './password-reset'

describe('password recovery helpers', () => {
  it('recognizes the dedicated reset route', () => {
    expect(isPasswordRecoveryLocation({ pathname: '/reset-password', search: '', hash: '' })).toBe(true)
    expect(isPasswordRecoveryLocation({ pathname: '/reset-password/', search: '', hash: '' })).toBe(true)
  })

  it('does not treat the route alone as a verified recovery token', () => {
    const location = { pathname: '/reset-password', search: '', hash: '' }
    expect(isPasswordRecoveryRoute(location)).toBe(true)
    expect(hasPasswordRecoveryToken(location)).toBe(false)
  })

  it('recognizes recovery links that return to the site root', () => {
    expect(isPasswordRecoveryLocation({ pathname: '/', search: '?type=recovery', hash: '' })).toBe(true)
    expect(isPasswordRecoveryLocation({ pathname: '/', search: '', hash: '#access_token=test&type=recovery' })).toBe(true)
  })

  it('does not treat an ordinary login URL as recovery', () => {
    expect(isPasswordRecoveryLocation({ pathname: '/', search: '', hash: '' })).toBe(false)
  })

  it('creates an exact reset-password redirect', () => {
    expect(getPasswordResetRedirect('http://localhost:5173')).toBe('http://localhost:5173/reset-password')
  })

  it('validates length, character requirements, and matching confirmation', () => {
    expect(validateNewPassword('', '')).toBe('Enter a new password.')
    expect(validateNewPassword('short', 'short')).toBe('Use at least 8 characters.')
    expect(validateNewPassword('lowercase1!', 'lowercase1!')).toBe('Include at least one uppercase letter.')
    expect(validateNewPassword('UPPERCASE1!', 'UPPERCASE1!')).toBe('Include at least one lowercase letter.')
    expect(validateNewPassword('NoNumber!', 'NoNumber!')).toBe('Include at least one number.')
    expect(validateNewPassword('NoSymbol1', 'NoSymbol1')).toBe('Include at least one symbol.')
    expect(validateNewPassword('Secure1!', 'Different1!')).toBe('The passwords do not match.')
    expect(validateNewPassword('Secure1!', 'Secure1!')).toBeNull()
  })
})
