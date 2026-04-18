import { expect, test, type APIRequestContext } from '@playwright/test'

const apiBaseUrl = 'http://localhost:8117'
/** Tenant padrao dos testes existentes */
const tenantA = '11111111-1111-1111-1111-111111111111'
/** Segundo tenant para regressao de isolamento (GUID fixo distinto do tenant A) */
const tenantB = '22222222-2222-2222-2222-222222222222'

const masterEmail = 'admin@cmms.local'
const masterPassword = 'Naotemsenha0('

function headersJson(token: string, tenantId: string) {
  return {
    Authorization: `Bearer ${token}`,
    'X-Tenant-Id': tenantId,
    'Content-Type': 'application/json',
  }
}

function headersDelete(token: string, tenantId: string) {
  return {
    Authorization: `Bearer ${token}`,
    'X-Tenant-Id': tenantId,
  }
}

async function loginAsMaster(request: APIRequestContext, tenantId: string) {
  const res = await request.post(`${apiBaseUrl}/api/auth/login`, {
    headers: {
      'X-Tenant-Id': tenantId,
      'Content-Type': 'application/json',
    },
    data: { email: masterEmail, password: masterPassword },
  })
  expect(res.ok()).toBeTruthy()
  const body = (await res.json()) as { accessToken: string; user: { tenantId: string } }
  expect(body.user.tenantId).toBe(tenantId)
  return body.accessToken
}

test('lista de Kanban tasks nao cruza tenants (token e header alinhados)', async ({ request }) => {
  const tokenA = await loginAsMaster(request, tenantA)
  const tokenB = await loginAsMaster(request, tenantB)

  const suffix = Date.now()
  const titleA = `[ISOL-A] tenant-isolation ${suffix}`
  const titleB = `[ISOL-B] tenant-isolation ${suffix}`

  const createA = await request.post(`${apiBaseUrl}/api/tasks`, {
    headers: headersJson(tokenA, tenantA),
    data: {
      title: titleA,
      description: 'regressao isolamento tenant A',
      type: 'feature',
      module: 'QA',
      assignee: 'Unassigned',
      estimateHours: 0.5,
    },
  })
  expect(createA.ok()).toBeTruthy()
  const taskA = (await createA.json()) as { id: string }

  const createB = await request.post(`${apiBaseUrl}/api/tasks`, {
    headers: headersJson(tokenB, tenantB),
    data: {
      title: titleB,
      description: 'regressao isolamento tenant B',
      type: 'feature',
      module: 'QA',
      assignee: 'Unassigned',
      estimateHours: 0.5,
    },
  })
  expect(createB.ok()).toBeTruthy()
  const taskB = (await createB.json()) as { id: string }

  expect(taskA.id).not.toBe(taskB.id)

  try {
    const listA = await request.get(`${apiBaseUrl}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'X-Tenant-Id': tenantA,
      },
    })
    expect(listA.ok()).toBeTruthy()
    const tasksA = (await listA.json()) as { id: string }[]
    const idsA = new Set(tasksA.map((t) => t.id))
    expect(idsA.has(taskA.id)).toBeTruthy()
    expect(idsA.has(taskB.id)).toBeFalsy()

    const listB = await request.get(`${apiBaseUrl}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${tokenB}`,
        'X-Tenant-Id': tenantB,
      },
    })
    expect(listB.ok()).toBeTruthy()
    const tasksB = (await listB.json()) as { id: string }[]
    const idsB = new Set(tasksB.map((t) => t.id))
    expect(idsB.has(taskB.id)).toBeTruthy()
    expect(idsB.has(taskA.id)).toBeFalsy()
  } finally {
    // Limpeza para nao poluir o quadro; ignora falha se a API em 8117 for imagem antiga sem DELETE.
    await request.delete(`${apiBaseUrl}/api/tasks/${taskA.id}`, {
      headers: headersDelete(tokenA, tenantA),
    })
    await request.delete(`${apiBaseUrl}/api/tasks/${taskB.id}`, {
      headers: headersDelete(tokenB, tenantB),
    })
  }
})
