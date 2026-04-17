import { expect, test } from '@playwright/test'

const tenantId = '11111111-1111-1111-1111-111111111111'
const apiBaseUrl = 'http://localhost:8117'

test('login returns bearer token with expected JWT contract', async ({ request }) => {
  const loginResponse = await request.post(`${apiBaseUrl}/api/auth/login`, {
    headers: {
      'X-Tenant-Id': tenantId,
      'Content-Type': 'application/json',
    },
    data: {
      email: 'admin@cmms.local',
      password: 'Naotemsenha0(',
    },
  })

  expect(loginResponse.ok()).toBeTruthy()
  const body = (await loginResponse.json()) as {
    accessToken: string
    tokenType: string
    expiresAtUtc: string
    user: { role: string; tenantId: string; email: string }
  }

  expect(body.tokenType).toBe('Bearer')
  expect(body.user.role).toBe('admin_master')
  expect(body.user.tenantId).toBe(tenantId)
  expect(body.user.email).toBe('admin@cmms.local')

  const claims = parseJwtPayload(body.accessToken)
  expect(claims.iss).toBe('Devcraft.CMMS')
  expect(claims.aud).toBe('Devcraft.CMMS.Web')
  expect(claims.role).toBe('admin_master')
  expect(claims.tenant_id).toBe(tenantId)
  expect(typeof claims.jti).toBe('string')
  expect((claims.jti as string).length).toBeGreaterThan(8)

  const nbf = Number(claims.nbf)
  const exp = Number(claims.exp)
  expect(Number.isFinite(nbf)).toBeTruthy()
  expect(Number.isFinite(exp)).toBeTruthy()
  const ttlHours = (exp - nbf) / 3600
  expect(ttlHours).toBeGreaterThanOrEqual(7.9)
  expect(ttlHours).toBeLessThanOrEqual(8.1)
})

test('policy guard denies anonymous and allows admin_master for protected endpoints', async ({ request }) => {
  const noTokenResponse = await request.get(`${apiBaseUrl}/api/tasks`, {
    headers: {
      'X-Tenant-Id': tenantId,
    },
  })
  expect(noTokenResponse.status()).toBe(401)

  const loginResponse = await request.post(`${apiBaseUrl}/api/auth/login`, {
    headers: {
      'X-Tenant-Id': tenantId,
      'Content-Type': 'application/json',
    },
    data: {
      email: 'admin@cmms.local',
      password: 'Naotemsenha0(',
    },
  })
  expect(loginResponse.ok()).toBeTruthy()
  const loginBody = (await loginResponse.json()) as { accessToken: string }

  const protectedResponse = await request.get(`${apiBaseUrl}/api/changelog`, {
    headers: {
      Authorization: `Bearer ${loginBody.accessToken}`,
      'X-Tenant-Id': tenantId,
    },
  })
  expect(protectedResponse.ok()).toBeTruthy()
})

function parseJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.')
  expect(payload).toBeTruthy()

  const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
  const paddedPayload = normalizedPayload.padEnd(normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4), '=')
  const json = Buffer.from(paddedPayload, 'base64').toString('utf8')
  return JSON.parse(json) as Record<string, unknown>
}
