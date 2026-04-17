export async function getApiHealth() {
  const response = await fetch('/health')
  if (!response.ok) {
    throw new Error('API health check failed')
  }

  return response.json() as Promise<{ status: string; utcNow: string }>
}

