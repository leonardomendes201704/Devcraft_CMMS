import fs from 'node:fs/promises'
import path from 'node:path'
import { expect, test } from '@playwright/test'

test('kanban renders and creates task', async ({ page, request }, testInfo) => {
  const taskTitle = `Validacao E2E Kanban ${Date.now()}`
  const tenantId = '11111111-1111-1111-1111-111111111111'
  const apiBaseUrl = 'http://localhost:8117'
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
  const loginResult = (await loginResponse.json()) as { accessToken: string }
  const authHeaders = {
    Authorization: `Bearer ${loginResult.accessToken}`,
    'X-Tenant-Id': tenantId,
    'Content-Type': 'application/json',
  }

  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@cmms.local')
  await page.getByLabel('Password').fill('Naotemsenha0(')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Devcraft CMMS - Kanban' })).toBeVisible()
  await page.getByRole('button', { name: 'View changelog' }).click()
  await expect(page.getByRole('heading', { name: 'Project Changelog' })).toBeVisible()
  await page.getByRole('button', { name: 'Close' }).first().click()

  const tasksMetricValue = page
    .locator('div')
    .filter({ has: page.getByText('Tasks') })
    .locator('p.text-lg')
    .first()

  const beforeText = await tasksMetricValue.innerText()
  const before = Number.parseInt(beforeText, 10)

  await page.getByRole('button', { name: 'New task' }).click()
  await page.getByPlaceholder('Task title').fill(taskTitle)
  await page.getByPlaceholder('Task description').fill('Criada por teste Playwright para evidenciar fluxo.')
  await page.getByRole('textbox', { name: 'Module', exact: true }).fill('QA')
  await page.locator('form input[type="number"]').fill('3')
  await page.getByRole('button', { name: 'Add task' }).click()

  await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible()
  await expect(tasksMetricValue).not.toHaveText(beforeText)

  const screenshotPath = testInfo.outputPath('kanban-after-create.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })

  const afterText = await tasksMetricValue.innerText()
  const after = Number.parseInt(afterText, 10)
  expect(after).toBeGreaterThanOrEqual(before + 1)

  const listResponse = await request.get(`${apiBaseUrl}/api/tasks`, {
    headers: authHeaders,
  })
  expect(listResponse.ok()).toBeTruthy()

  const tasks = (await listResponse.json()) as Array<{ id: string; title: string }>
  const createdTask = tasks.find((task) => task.title === taskTitle)
  expect(createdTask).toBeDefined()

  const taskId = createdTask!.id
  const evidenceFileName = `task-${taskId}-playwright-${Date.now()}.png`
  const evidenceDirectory = path.resolve(testInfo.config.rootDir, '../../../src/frontend/cmms-web/public/evidences')
  const evidenceAbsolutePath = path.join(evidenceDirectory, evidenceFileName)
  const evidencePublicUrl = `/evidences/${evidenceFileName}`

  await fs.mkdir(evidenceDirectory, { recursive: true })
  await fs.copyFile(screenshotPath, evidenceAbsolutePath)

  const addEvidence = await request.post(`${apiBaseUrl}/api/tasks/${taskId}/evidences`, {
    headers: authHeaders,
    data: {
      title: 'Playwright - Kanban after create',
      imageUrl: evidencePublicUrl,
      source: 'playwright',
      capturedAtUtc: new Date().toISOString(),
    },
  })
  expect(addEvidence.ok()).toBeTruthy()

  const toActive = await request.patch(`${apiBaseUrl}/api/tasks/${taskId}/status`, {
    headers: authHeaders,
    data: { status: 'active' },
  })
  expect(toActive.ok()).toBeTruthy()

  const toResolved = await request.patch(`${apiBaseUrl}/api/tasks/${taskId}/status`, {
    headers: authHeaders,
    data: { status: 'resolved' },
  })
  expect(toResolved.ok()).toBeTruthy()

  const setEffort = await request.patch(`${apiBaseUrl}/api/tasks/${taskId}/effort`, {
    headers: authHeaders,
    data: { spentHours: 0.5 },
  })
  expect(setEffort.ok()).toBeTruthy()

  const closeTask = await request.post(`${apiBaseUrl}/api/tasks/${taskId}/complete`, {
    headers: authHeaders,
    data: { spentHours: 0.5 },
  })
  expect(closeTask.ok()).toBeTruthy()

  const closedTask = (await closeTask.json()) as { evidences?: Array<{ imageUrl: string }> }
  expect(closedTask.evidences?.some((evidence) => evidence.imageUrl === evidencePublicUrl)).toBeTruthy()
})

test('cannot close frontend/api task without required evidences', async ({ request }) => {
  const tenantId = '11111111-1111-1111-1111-111111111111'
  const apiBaseUrl = 'http://localhost:8117'

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
  const loginResult = (await loginResponse.json()) as { accessToken: string }

  const authHeaders = {
    Authorization: `Bearer ${loginResult.accessToken}`,
    'X-Tenant-Id': tenantId,
    'Content-Type': 'application/json',
  }

  const createResponse = await request.post(`${apiBaseUrl}/api/tasks`, {
    headers: authHeaders,
    data: {
      title: `[TASK] Frontend + API close gate ${Date.now()}`,
      description: 'Fluxo frontend web + api endpoint payload validation.',
      type: 'test',
      module: 'Frontend API',
      estimateHours: 1,
    },
  })
  expect(createResponse.ok()).toBeTruthy()
  const created = (await createResponse.json()) as { id: string }

  const toActive = await request.patch(`${apiBaseUrl}/api/tasks/${created.id}/status`, {
    headers: authHeaders,
    data: { status: 'active' },
  })
  expect(toActive.ok()).toBeTruthy()

  const toResolved = await request.patch(`${apiBaseUrl}/api/tasks/${created.id}/status`, {
    headers: authHeaders,
    data: { status: 'resolved' },
  })
  expect(toResolved.ok()).toBeTruthy()

  const effort = await request.patch(`${apiBaseUrl}/api/tasks/${created.id}/effort`, {
    headers: authHeaders,
    data: { spentHours: 0.5 },
  })
  expect(effort.ok()).toBeTruthy()

  const closeWithoutEvidence = await request.post(`${apiBaseUrl}/api/tasks/${created.id}/complete`, {
    headers: authHeaders,
    data: { spentHours: 0.5 },
  })
  expect(closeWithoutEvidence.ok()).toBeFalsy()
  const closeError = (await closeWithoutEvidence.json()) as { errors?: Record<string, string[]> }
  expect(closeError.errors?.['evidences.frontend']?.length ?? 0).toBeGreaterThan(0)
  expect(closeError.errors?.['evidences.api']?.length ?? 0).toBeGreaterThan(0)

  const addFrontendEvidence = await request.post(`${apiBaseUrl}/api/tasks/${created.id}/evidences`, {
    headers: authHeaders,
    data: {
      title: 'Playwright frontend screenshot evidence',
      kind: 'image',
      imageUrl: '/evidences/playwright-placeholder.png',
      source: 'playwright',
      capturedAtUtc: new Date().toISOString(),
    },
  })
  expect(addFrontendEvidence.ok()).toBeTruthy()

  const addApiEvidence = await request.post(`${apiBaseUrl}/api/tasks/${created.id}/evidences`, {
    headers: authHeaders,
    data: {
      title: 'API response payload evidence',
      kind: 'api',
      payloadJson: JSON.stringify({
        endpoint: '/api/auth/login',
        method: 'POST',
        statusCode: 200,
      }),
      source: 'api-smoke',
      capturedAtUtc: new Date().toISOString(),
    },
  })
  expect(addApiEvidence.ok()).toBeTruthy()

  const closeWithEvidence = await request.post(`${apiBaseUrl}/api/tasks/${created.id}/complete`, {
    headers: authHeaders,
    data: { spentHours: 0.5 },
  })
  expect(closeWithEvidence.ok()).toBeTruthy()
})
