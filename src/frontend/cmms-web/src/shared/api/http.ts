import { getAccessToken } from '../auth/session'
import { mapApiMessageToPtBr } from './mapApiMessageToPtBr'

const defaultTenantId = '11111111-1111-1111-1111-111111111111'

function resolveTenantId() {
  const fromEnv = import.meta.env.VITE_TENANT_ID
  return fromEnv && fromEnv.trim() ? fromEnv.trim() : defaultTenantId
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = getAccessToken()

  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': resolveTenantId(),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const errorMessage = await parseApiErrorMessage(response)
    throw new Error(errorMessage || mapApiMessageToPtBr(`Request failed (${response.status})`))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

async function parseApiErrorMessage(response: Response): Promise<string> {
  const raw = (await response.text()).trim()

  if (!raw) {
    return mapApiMessageToPtBr(`Request failed (${response.status})`)
  }

  if (!raw.startsWith('{')) {
    return mapApiMessageToPtBr(raw)
  }

  let payload: {
    title?: string
    detail?: string
    errors?: Record<string, string[]>
    message?: string
  }

  try {
    payload = JSON.parse(raw) as typeof payload
  } catch {
    return mapApiMessageToPtBr(raw)
  }

  const validationMessages = Object.values(payload.errors ?? {})
    .flat()
    .map((message) => message.trim())
    .filter(Boolean)

  if (validationMessages.length > 0) {
    return mapApiMessageToPtBr(validationMessages.join(' '))
  }

  if (payload.detail?.trim()) {
    return mapApiMessageToPtBr(payload.detail.trim())
  }

  if (payload.message?.trim()) {
    return mapApiMessageToPtBr(payload.message.trim())
  }

  if (payload.title?.trim()) {
    return mapApiMessageToPtBr(payload.title.trim())
  }

  return mapApiMessageToPtBr(`Request failed (${response.status})`)
}
