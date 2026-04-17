import { getAccessToken } from '../auth/session'

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
    throw new Error(errorMessage || `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

async function parseApiErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as {
      title?: string
      detail?: string
      errors?: Record<string, string[]>
      message?: string
    }

    const validationMessages = Object.values(payload.errors ?? {})
      .flat()
      .map((message) => message.trim())
      .filter(Boolean)

    if (validationMessages.length > 0) {
      return validationMessages.join(' ')
    }

    if (payload.detail?.trim()) {
      return payload.detail.trim()
    }

    if (payload.title?.trim()) {
      return payload.title.trim()
    }

    if (payload.message?.trim()) {
      return payload.message.trim()
    }
  }

  const message = (await response.text()).trim()
  return message
}
