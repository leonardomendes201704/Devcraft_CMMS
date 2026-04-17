import { expect, test } from '@playwright/test'
import {
  captureAndAttachStepEvidence,
  closeTaskWithSpentHours,
  createAuthContext,
  createFrontendEvidenceTask,
  getTaskById,
} from './support/evidence'

test('home renders title', async ({ page }, testInfo) => {
  const authContext = await createAuthContext(page.request)
  const evidenceTask = await createFrontendEvidenceTask(
    page.request,
    authContext,
    `[TASK] Playwright login flow evidence ${Date.now()}`,
    'Captura passo a passo do fluxo de login/logout no frontend.',
  )

  await page.goto('/')
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 1, 'open home route')

  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible()
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 2, 'login form visible')

  await page.getByLabel('Email').fill('admin@cmms.local')
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 3, 'email filled')

  await page.getByLabel('Password').fill('Naotemsenha0(')
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 4, 'password filled')

  await page.getByRole('button', { name: 'Sign in' }).click()
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 5, 'submitted sign in')

  await expect(page.getByRole('heading', { name: 'Devcraft CMMS - Kanban' })).toBeVisible()
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 6, 'kanban loaded after login')

  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible()
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 7, 'logout returned to login')

  await closeTaskWithSpentHours(page.request, evidenceTask, 0.6)

  const task = await getTaskById(page.request, authContext, evidenceTask.taskId)
  const evidenceTitles = (task.evidences ?? []).map((evidence) => evidence.title)
  expect(evidenceTitles.filter((title) => title.startsWith('Step ')).length).toBeGreaterThanOrEqual(7)
})
