import { expect, test } from '@playwright/test'
import {
  captureAndAttachStepEvidence,
  closeTaskWithSpentHours,
  createAuthContext,
  createFrontendEvidenceTask,
  getTaskById,
} from './support/evidence'

test('kanban renders and creates task', async ({ page, request }, testInfo) => {
  const taskTitle = `Smoke board card ${Date.now()}`
  const authContext = await createAuthContext(request)
  const evidenceTask = await createFrontendEvidenceTask(
    request,
    authContext,
    `[TASK] Playwright kanban step evidence ${Date.now()}`,
    'Captura passo a passo do fluxo Kanban com criacao e validacao de task.',
  )

  await page.goto('/login')
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 1, 'open login page')

  await page.getByLabel('Email').fill('admin@cmms.local')
  await page.getByLabel('Password').fill('Naotemsenha0(')
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 2, 'credentials filled')

  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app\/home$/)
  await page.getByRole('link', { name: /Kanban/i }).click()
  await expect(page).toHaveURL(/\/app\/kanban$/)
  await expect(page.getByRole('heading', { name: 'Devcraft CMMS - Kanban' })).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 3, 'kanban loaded')

  await page.getByRole('button', { name: 'View changelog' }).click()
  await expect(page.getByRole('heading', { name: 'Project Changelog' })).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 4, 'changelog modal opened')

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
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 5, 'new task form filled')

  await page.getByRole('button', { name: 'Add task' }).click()

  await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible()
  await expect(tasksMetricValue).not.toHaveText(beforeText)
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 6, 'task created and visible')

  const afterText = await tasksMetricValue.innerText()
  const after = Number.parseInt(afterText, 10)
  expect(after).toBeGreaterThanOrEqual(before + 1)

  const listResponse = await request.get('http://localhost:8117/api/tasks', {
    headers: authContext.authHeaders,
  })
  expect(listResponse.ok()).toBeTruthy()

  const tasks = (await listResponse.json()) as Array<{ id: string; title: string; status: string }>
  const createdTask = tasks.find((task) => task.title === taskTitle)
  expect(createdTask).toBeDefined()

  await page.getByRole('heading', { name: taskTitle }).dblclick()
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 7, 'task details modal opened')

  await page.getByRole('button', { name: 'Close' }).first().click()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 8, 'flow completed with modal closed')

  const toActive = await request.patch(`http://localhost:8117/api/tasks/${createdTask!.id}/status`, {
    headers: authContext.authHeaders,
    data: { status: 'active' },
  })
  expect(toActive.ok()).toBeTruthy()

  const toResolved = await request.patch(`http://localhost:8117/api/tasks/${createdTask!.id}/status`, {
    headers: authContext.authHeaders,
    data: { status: 'resolved' },
  })
  expect(toResolved.ok()).toBeTruthy()

  const setEffort = await request.patch(`http://localhost:8117/api/tasks/${createdTask!.id}/effort`, {
    headers: authContext.authHeaders,
    data: { spentHours: 0.2 },
  })
  expect(setEffort.ok()).toBeTruthy()

  const addCleanupEvidence = await request.post(`http://localhost:8117/api/tasks/${createdTask!.id}/evidences`, {
    headers: authContext.authHeaders,
    data: {
      title: 'Step 00 - cleanup evidence',
      kind: 'image',
      imageUrl: '/evidences/playwright-placeholder.png',
      source: 'playwright',
      capturedAtUtc: new Date().toISOString(),
    },
  })
  expect(addCleanupEvidence.ok()).toBeTruthy()

  const closeCreatedTask = await request.post(`http://localhost:8117/api/tasks/${createdTask!.id}/complete`, {
    headers: authContext.authHeaders,
    data: { spentHours: 0.2 },
  })
  expect(closeCreatedTask.ok()).toBeTruthy()

  await closeTaskWithSpentHours(request, evidenceTask, 0.8)
  const evidenceTaskData = await getTaskById(request, authContext, evidenceTask.taskId)
  const stepEvidenceTitles = (evidenceTaskData.evidences ?? []).map((evidence) => evidence.title)

  expect(stepEvidenceTitles.some((title) => title.startsWith('Step 01'))).toBeTruthy()
  expect(stepEvidenceTitles.some((title) => title.startsWith('Step 08'))).toBeTruthy()
  expect(stepEvidenceTitles.filter((title) => title.startsWith('Step ')).length).toBeGreaterThanOrEqual(8)
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
