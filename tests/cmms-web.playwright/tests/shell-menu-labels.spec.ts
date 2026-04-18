import { expect, test } from '@playwright/test'
import {
  captureAndAttachStepEvidence,
  closeTaskWithSpentHours,
  createAuthContext,
  createFrontendEvidenceTask,
  getTaskById,
} from './support/evidence'

test('shell sidebar shows short labels without Administration prefix', async ({ page }, testInfo) => {
  const authContext = await createAuthContext(page.request)
  const evidenceTask = await createFrontendEvidenceTask(
    page.request,
    authContext,
    `[TASK] Shell menu labels without Administration prefix ${Date.now()}`,
    'Valida que a sidebar do frontend usa rotulos curtos (Usuarios/Departamentos/Cargos) ao inves do prefixo "Administracao de".',
  )

  await page.goto('/')
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 1, 'open login page')

  await page.getByLabel('Email').fill('admin@cmms.local')
  await page.getByLabel('Password').fill('Naotemsenha0(')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/app\/home$/)
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 2, 'shell home loaded after login')

  const nav = page.getByRole('navigation')
  await expect(nav.getByRole('link', { name: /^Usuarios$/ })).toBeVisible()
  await expect(nav.getByRole('link', { name: /^Departamentos$/ })).toBeVisible()
  await expect(nav.getByRole('link', { name: /^Cargos$/ })).toBeVisible()

  await expect(nav.getByText(/Administracao de/i)).toHaveCount(0)

  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 3, 'sidebar menu with short labels')

  await closeTaskWithSpentHours(page.request, evidenceTask, 0.3)

  const task = await getTaskById(page.request, authContext, evidenceTask.taskId)
  const evidenceTitles = (task.evidences ?? []).map((evidence) => evidence.title)
  expect(evidenceTitles.filter((title) => title.startsWith('Step ')).length).toBeGreaterThanOrEqual(3)
})
