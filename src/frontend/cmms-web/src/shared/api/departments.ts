import { apiFetch } from './http'

export type AuthDepartment = {
  id: string
  name: string
  code: string
  description: string | null
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc: string | null
}

export type CreateAuthDepartmentPayload = {
  name: string
  code: string
  description?: string | null
  isActive?: boolean
}

export type UpdateAuthDepartmentPayload = {
  name?: string
  code?: string
  description?: string | null
  isActive?: boolean
}

export async function listAuthDepartments() {
  return apiFetch<AuthDepartment[]>('/api/auth/departments')
}

export async function getAuthDepartmentById(id: string) {
  return apiFetch<AuthDepartment>(`/api/auth/departments/${id}`)
}

export async function createAuthDepartment(payload: CreateAuthDepartmentPayload) {
  return apiFetch<AuthDepartment>('/api/auth/departments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAuthDepartment(id: string, payload: UpdateAuthDepartmentPayload) {
  return apiFetch<AuthDepartment>(`/api/auth/departments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
