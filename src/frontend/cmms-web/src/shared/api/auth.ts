import { apiFetch } from './http'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  tokenType: string
  expiresAtUtc: string
  user: {
    email: string
    role: string
    tenantId: string
  }
}

export async function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
