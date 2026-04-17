const tokenKey = 'cmms_access_token'
const userKey = 'cmms_user_session'

export type SessionUser = {
  email: string
  role: string
  tenantId: string
}

export function getAccessToken() {
  return localStorage.getItem(tokenKey)
}

export function setAccessToken(token: string) {
  localStorage.setItem(tokenKey, token)
}

export function getSessionUser(): SessionUser | null {
  const raw = localStorage.getItem(userKey)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as SessionUser
    if (!parsed.email || !parsed.role || !parsed.tenantId) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function setSessionUser(user: SessionUser) {
  localStorage.setItem(userKey, JSON.stringify(user))
}

export function clearAccessToken() {
  localStorage.removeItem(tokenKey)
  localStorage.removeItem(userKey)
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}

export function hasAnyRole(roles: string[]) {
  const user = getSessionUser()
  if (!user) {
    return false
  }

  return roles.some((role) => role === user.role)
}
