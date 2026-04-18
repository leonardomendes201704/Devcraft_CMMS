import { apiFetch } from './http'

export type AuthJob = {
  id: string
  departmentId: string
  departmentName: string
  name: string
  code: string
  description: string | null
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc: string | null
}

export type CreateAuthJobPayload = {
  departmentId: string
  name: string
  code: string
  description?: string | null
  isActive?: boolean
}

export type UpdateAuthJobPayload = {
  departmentId?: string
  name?: string
  code?: string
  description?: string | null
  isActive?: boolean
}

export async function listAuthJobs(departmentId?: string) {
  const query = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : ''
  return apiFetch<AuthJob[]>(`/api/auth/jobs${query}`)
}

export async function getAuthJobById(id: string) {
  return apiFetch<AuthJob>(`/api/auth/jobs/${id}`)
}

export async function createAuthJob(payload: CreateAuthJobPayload) {
  return apiFetch<AuthJob>('/api/auth/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAuthJob(id: string, payload: UpdateAuthJobPayload) {
  return apiFetch<AuthJob>(`/api/auth/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
