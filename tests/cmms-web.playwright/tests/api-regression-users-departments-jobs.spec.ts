/**
 * Regressao API: usuarios, departamentos e cargos (rotas /api/auth/*).
 * Artefatos JSON em tests/cmms-web.playwright/evidence-output/api/ (ver guidelines).
 */
import { expect, test } from '@playwright/test'
import { createAuthContext, writeApiRegressionArtifact } from './support/evidence'

const apiBaseUrl = 'http://localhost:8117'

test.describe('API regression — departments', () => {
  test('list, create, get by id, patch, conflict on duplicate code', async ({ request }, testInfo) => {
    const { authHeaders } = await createAuthContext(request)
    const suffix = Date.now()
    const code = `T${String(suffix).slice(-6)}`
    const name = `API Dept ${suffix}`

    const listBefore = await request.get(`${apiBaseUrl}/api/auth/departments`, { headers: authHeaders })
    expect(listBefore.ok()).toBeTruthy()
    const listJson = (await listBefore.json()) as { id: string }[]

    const create = await request.post(`${apiBaseUrl}/api/auth/departments`, {
      headers: authHeaders,
      data: {
        name,
        code,
        description: 'criado por api-regression',
        isActive: true,
      },
    })
    expect(create.status()).toBe(201)
    const created = (await create.json()) as { id: string; code: string }

    const getOne = await request.get(`${apiBaseUrl}/api/auth/departments/${created.id}`, { headers: authHeaders })
    expect(getOne.ok()).toBeTruthy()
    expect((await getOne.json() as { code: string }).code).toBe(code)

    const patch = await request.patch(`${apiBaseUrl}/api/auth/departments/${created.id}`, {
      headers: authHeaders,
      data: { description: 'atualizado por regressao API' },
    })
    expect(patch.ok()).toBeTruthy()

    const dup = await request.post(`${apiBaseUrl}/api/auth/departments`, {
      headers: authHeaders,
      data: { name: 'Outro nome', code, description: null, isActive: true },
    })
    expect(dup.status()).toBe(409)

    await writeApiRegressionArtifact(testInfo, 'departments-crud', {
      ok: true,
      listCountBefore: listJson.length,
      createdId: created.id,
      duplicateReturns409: true,
    })
  })
})

test.describe('API regression — jobs', () => {
  test('create with department, list filter, get by id, patch, duplicate code conflict', async ({ request }, testInfo) => {
    const { authHeaders } = await createAuthContext(request)
    const suffix = Date.now()
    const deptCode = `JD${String(suffix).slice(-5)}`
    const deptRes = await request.post(`${apiBaseUrl}/api/auth/departments`, {
      headers: authHeaders,
      data: { name: `API Job Dept ${suffix}`, code: deptCode, description: 'parent', isActive: true },
    })
    expect(deptRes.ok()).toBeTruthy()
    const dept = (await deptRes.json()) as { id: string }

    const jobCode = `JB${String(suffix).slice(-5)}`
    const create = await request.post(`${apiBaseUrl}/api/auth/jobs`, {
      headers: authHeaders,
      data: {
        departmentId: dept.id,
        name: `API Job ${suffix}`,
        code: jobCode,
        description: 'job regressao',
        isActive: true,
      },
    })
    expect(create.status()).toBe(201)
    const job = (await create.json()) as { id: string }

    const listFiltered = await request.get(`${apiBaseUrl}/api/auth/jobs?departmentId=${dept.id}`, { headers: authHeaders })
    expect(listFiltered.ok()).toBeTruthy()
    const jobs = (await listFiltered.json()) as { id: string }[]
    expect(jobs.some((j) => j.id === job.id)).toBeTruthy()

    const getOne = await request.get(`${apiBaseUrl}/api/auth/jobs/${job.id}`, { headers: authHeaders })
    expect(getOne.ok()).toBeTruthy()

    const patch = await request.patch(`${apiBaseUrl}/api/auth/jobs/${job.id}`, {
      headers: authHeaders,
      data: { description: 'job atualizado regressao' },
    })
    expect(patch.ok()).toBeTruthy()

    const dup = await request.post(`${apiBaseUrl}/api/auth/jobs`, {
      headers: authHeaders,
      data: {
        departmentId: dept.id,
        name: 'Outro cargo',
        code: jobCode,
        description: null,
        isActive: true,
      },
    })
    expect(dup.status()).toBe(409)

    await writeApiRegressionArtifact(testInfo, 'jobs-crud', {
      ok: true,
      departmentId: dept.id,
      jobId: job.id,
      duplicateReturns409: true,
    })
  })
})

test.describe('API regression — users', () => {
  test('list, create, get by id, patch role', async ({ request }, testInfo) => {
    const { authHeaders } = await createAuthContext(request)
    const suffix = Date.now()
    const email = `api.reg.${suffix}@cmms.local`

    const list = await request.get(`${apiBaseUrl}/api/auth/users`, { headers: authHeaders })
    expect(list.ok()).toBeTruthy()
    const usersBefore = (await list.json()) as { id: string }[]

    const create = await request.post(`${apiBaseUrl}/api/auth/users`, {
      headers: authHeaders,
      data: {
        email,
        password: 'ApiRegressPassw0rd!',
        role: 'admin',
        isActive: true,
        profile: {
          fullName: 'API Regression User',
          displayName: 'ApiReg',
          locale: 'pt-BR',
          timeZone: 'America/Sao_Paulo',
          metadataJson: '{}',
        },
      },
    })
    expect(create.status()).toBe(201)
    const created = (await create.json()) as { id: string; email: string }

    const getOne = await request.get(`${apiBaseUrl}/api/auth/users/${created.id}`, { headers: authHeaders })
    expect(getOne.ok()).toBeTruthy()

    const patch = await request.patch(`${apiBaseUrl}/api/auth/users/${created.id}`, {
      headers: authHeaders,
      data: { role: 'technician' },
    })
    expect(patch.ok()).toBeTruthy()
    const updated = (await patch.json()) as { role: string }
    expect(updated.role).toBe('technician')

    await writeApiRegressionArtifact(testInfo, 'users-crud', {
      ok: true,
      listCountBefore: usersBefore.length,
      createdId: created.id,
      email,
      patchedRole: 'technician',
    })
  })
})
