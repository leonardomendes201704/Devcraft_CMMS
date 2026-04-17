import fs from 'node:fs/promises'
import path from 'node:path'
import { expect, type APIRequestContext, type Page, type TestInfo } from '@playwright/test'

const tenantId = '11111111-1111-1111-1111-111111111111'
const apiBaseUrl = 'http://localhost:8117'

type ApiTask = {
  id: string
  title: string
  evidences?: Array<{ id: string; title: string; imageUrl: string; source: string }>
}

export type AuthContext = {
  authHeaders: Record<string, string>
}

export type EvidenceTaskContext = AuthContext & {
  taskId: string
}

export async function createAuthContext(request: APIRequestContext): Promise<AuthContext> {
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

  return {
    authHeaders: {
      Authorization: `Bearer ${loginResult.accessToken}`,
      'X-Tenant-Id': tenantId,
      'Content-Type': 'application/json',
    },
  }
}

export async function createFrontendEvidenceTask(
  request: APIRequestContext,
  authContext: AuthContext,
  title: string,
  description: string,
): Promise<EvidenceTaskContext> {
  const createResponse = await request.post(`${apiBaseUrl}/api/tasks`, {
    headers: authContext.authHeaders,
    data: {
      title,
      description,
      type: 'test',
      module: 'Frontend E2E',
      assignee: 'QA-Automation',
      estimateHours: 2,
    },
  })

  expect(createResponse.ok()).toBeTruthy()
  const created = (await createResponse.json()) as { id: string }

  return {
    ...authContext,
    taskId: created.id,
  }
}

export async function captureAndAttachStepEvidence(
  request: APIRequestContext,
  page: Page,
  testInfo: TestInfo,
  context: EvidenceTaskContext,
  stepNumber: number,
  stepName: string,
): Promise<void> {
  const normalizedStep = String(stepNumber).padStart(2, '0')
  const stepSlug = slugify(stepName)
  const screenshotPath = testInfo.outputPath(`step-${normalizedStep}-${stepSlug}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })

  const evidenceFileName = `task-${context.taskId}-pw-step-${normalizedStep}-${stepSlug}-${Date.now()}.png`
  const evidenceDirectory = path.resolve(testInfo.config.rootDir, '../../../src/frontend/cmms-web/public/evidences')
  const evidenceAbsolutePath = path.join(evidenceDirectory, evidenceFileName)
  const evidencePublicUrl = `/evidences/${evidenceFileName}`

  await fs.mkdir(evidenceDirectory, { recursive: true })
  await fs.copyFile(screenshotPath, evidenceAbsolutePath)

  const addEvidence = await request.post(`${apiBaseUrl}/api/tasks/${context.taskId}/evidences`, {
    headers: context.authHeaders,
    data: {
      title: `Step ${normalizedStep} - ${stepName}`,
      kind: 'image',
      imageUrl: evidencePublicUrl,
      source: 'playwright',
      capturedAtUtc: new Date().toISOString(),
    },
  })

  expect(addEvidence.ok()).toBeTruthy()
}

export async function closeTaskWithSpentHours(
  request: APIRequestContext,
  context: EvidenceTaskContext,
  spentHours: number,
): Promise<void> {
  const toActive = await request.patch(`${apiBaseUrl}/api/tasks/${context.taskId}/status`, {
    headers: context.authHeaders,
    data: { status: 'active' },
  })
  expect(toActive.ok()).toBeTruthy()

  const toResolved = await request.patch(`${apiBaseUrl}/api/tasks/${context.taskId}/status`, {
    headers: context.authHeaders,
    data: { status: 'resolved' },
  })
  expect(toResolved.ok()).toBeTruthy()

  const setEffort = await request.patch(`${apiBaseUrl}/api/tasks/${context.taskId}/effort`, {
    headers: context.authHeaders,
    data: { spentHours },
  })
  expect(setEffort.ok()).toBeTruthy()

  const closeTask = await request.post(`${apiBaseUrl}/api/tasks/${context.taskId}/complete`, {
    headers: context.authHeaders,
    data: { spentHours },
  })
  expect(closeTask.ok()).toBeTruthy()
}

export async function getTaskById(request: APIRequestContext, context: AuthContext, taskId: string): Promise<ApiTask> {
  const listResponse = await request.get(`${apiBaseUrl}/api/tasks`, {
    headers: context.authHeaders,
  })
  expect(listResponse.ok()).toBeTruthy()
  const tasks = (await listResponse.json()) as ApiTask[]
  const task = tasks.find((item) => item.id === taskId)
  expect(task).toBeDefined()
  return task!
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
