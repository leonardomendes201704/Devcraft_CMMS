import { apiFetch } from './http'

export type AuthRole = 'admin_master' | 'admin' | 'technician'

export type AuthUserProfile = {
  authUserId: string
  fullName: string
  displayName: string | null
  phoneE164: string | null
  jobTitle: string | null
  department: string | null
  employeeCode: string | null
  managerAuthUserId: string | null
  timeZone: string | null
  locale: string | null
  avatarUrl: string | null
  emergencyContactName: string | null
  emergencyContactPhoneE164: string | null
  birthDate: string | null
  hireDate: string | null
  metadataJson: string
}

export type AuthUser = {
  id: string
  email: string
  role: AuthRole
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc: string | null
  lastLoginAtUtc: string | null
  profile: AuthUserProfile | null
}

export type UserProfilePayload = {
  fullName: string
  displayName?: string | null
  phoneE164?: string | null
  jobTitle?: string | null
  department?: string | null
  employeeCode?: string | null
  managerAuthUserId?: string | null
  timeZone?: string | null
  locale?: string | null
  avatarUrl?: string | null
  emergencyContactName?: string | null
  emergencyContactPhoneE164?: string | null
  birthDate?: string | null
  hireDate?: string | null
  metadataJson?: string | null
}

export type CreateAuthUserPayload = {
  email: string
  password: string
  role: AuthRole
  isActive?: boolean
  profile: UserProfilePayload
}

export type UpdateAuthUserPayload = {
  role?: AuthRole
  isActive?: boolean
  profile?: UserProfilePayload
}

export type ResetAuthUserPasswordPayload = {
  password: string
}

export async function listAuthUsers() {
  return apiFetch<AuthUser[]>('/api/auth/users')
}

export async function getAuthUserById(userId: string) {
  return apiFetch<AuthUser>(`/api/auth/users/${userId}`)
}

export async function createAuthUser(payload: CreateAuthUserPayload) {
  return apiFetch<AuthUser>('/api/auth/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAuthUser(userId: string, payload: UpdateAuthUserPayload) {
  return apiFetch<AuthUser>(`/api/auth/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function resetAuthUserPassword(userId: string, payload: ResetAuthUserPasswordPayload) {
  return apiFetch<AuthUser>(`/api/auth/users/${userId}/reset-password`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
