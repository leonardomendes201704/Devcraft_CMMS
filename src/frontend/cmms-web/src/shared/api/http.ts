const defaultTenantId = '11111111-1111-1111-1111-111111111111'

function resolveTenantId() {
  const fromEnv = import.meta.env.VITE_TENANT_ID
  return fromEnv && fromEnv.trim() ? fromEnv.trim() : defaultTenantId
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': resolveTenantId(),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
