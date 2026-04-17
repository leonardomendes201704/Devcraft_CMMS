import fs from 'node:fs/promises'
import path from 'node:path'
import { expect, test } from '@playwright/test'

test('kanban renders and creates task', async ({ page, request }, testInfo) => {
  const taskTitle = `Validacao E2E Kanban ${Date.now()}`
  const tenantId = '11111111-1111-1111-1111-111111111111'
  const apiBaseUrl = 'http://localhost:8117'

  await page.goto('/kanban')
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
    headers: {
      'X-Tenant-Id': tenantId,
    },
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

  const mutationHeaders = {
    'Content-Type': 'application/json',
    'X-Tenant-Id': tenantId,
  }

  const addEvidence = await request.post(`${apiBaseUrl}/api/tasks/${taskId}/evidences`, {
    headers: mutationHeaders,
    data: {
      title: 'Playwright - Kanban after create',
      imageUrl: evidencePublicUrl,
      source: 'playwright',
      capturedAtUtc: new Date().toISOString(),
    },
  })
  expect(addEvidence.ok()).toBeTruthy()

  const toActive = await request.patch(`${apiBaseUrl}/api/tasks/${taskId}/status`, {
    headers: mutationHeaders,
    data: { status: 'active' },
  })
  expect(toActive.ok()).toBeTruthy()

  const toResolved = await request.patch(`${apiBaseUrl}/api/tasks/${taskId}/status`, {
    headers: mutationHeaders,
    data: { status: 'resolved' },
  })
  expect(toResolved.ok()).toBeTruthy()

  const setEffort = await request.patch(`${apiBaseUrl}/api/tasks/${taskId}/effort`, {
    headers: mutationHeaders,
    data: { spentHours: 0.5 },
  })
  expect(setEffort.ok()).toBeTruthy()

  const closeTask = await request.post(`${apiBaseUrl}/api/tasks/${taskId}/complete`, {
    headers: mutationHeaders,
    data: { spentHours: 0.5 },
  })
  expect(closeTask.ok()).toBeTruthy()

  const closedTask = (await closeTask.json()) as { evidences?: Array<{ imageUrl: string }> }
  expect(closedTask.evidences?.some((evidence) => evidence.imageUrl === evidencePublicUrl)).toBeTruthy()
})
