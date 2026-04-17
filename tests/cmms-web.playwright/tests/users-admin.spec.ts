import { expect, test } from '@playwright/test'
import {
  captureAndAttachStepEvidence,
  closeTaskWithSpentHours,
  createAuthContext,
  createFrontendEvidenceTask,
  getTaskById,
} from './support/evidence'

test('user admin screen creates and updates user', async ({ page, request }, testInfo) => {
  const authContext = await createAuthContext(request)
  const evidenceTask = await createFrontendEvidenceTask(
    request,
    authContext,
    `[TASK] Playwright user admin flow evidence ${Date.now()}`,
    'Captura passo a passo de cadastro e manutencao de usuario no frontend admin.',
  )

  const suffix = Date.now()
  const testEmail = `qa.user.${suffix}@cmms.local`

  await page.goto('/login')
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 1, 'open login page')

  await page.getByLabel('Email').fill('admin@cmms.local')
  await page.getByLabel('Password').fill('Naotemsenha0(')
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 2, 'credentials filled')

  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app\/home$/)
  await expect(page.getByRole('heading', { name: 'Devcraft CMMS' })).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 3, 'shell home loaded after login')

  await page.getByRole('link', { name: /Administracao de usuarios|User administration|User Admin/i }).click()
  await expect(page).toHaveURL(/\/app\/admin\/users$/)
  await expect(page.getByRole('heading', { name: 'User Administration' })).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 4, 'user list page opened')

  await page.getByRole('link', { name: 'Create user' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/users\/create$/)
  await expect(page.getByRole('heading', { name: 'Create User' })).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 5, 'user create page opened')

  await page.getByLabel('User email').fill(testEmail)
  await page.getByLabel('User password').fill('QaFlowPassw0rd!')
  await page.getByLabel('User role').selectOption('admin')
  await page.getByRole('button', { name: 'Create user' }).click()
  await expect(page).toHaveURL(new RegExp(`/app/admin/users/.+`))
  await expect(page.getByRole('heading', { name: 'User Details' })).toBeVisible()
  await expect(page.getByText(testEmail)).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 6, 'user created and details opened')

  await page.getByRole('link', { name: 'Edit user' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/users\/.+\/edit$/)
  await page.getByLabel('User role').selectOption('technician')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Role: Technician')).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 7, 'user role updated on edit page')

  await page.getByLabel('Reset password').fill('QaFlowPassw0rd!2')
  await page.getByRole('button', { name: 'Reset password' }).click()
  await expect(page.getByLabel('Reset password')).toHaveValue('')
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 8, 'password reset completed on edit page')

  await closeTaskWithSpentHours(request, evidenceTask, 0.8)

  const evidenceTaskData = await getTaskById(request, authContext, evidenceTask.taskId)
  const stepEvidenceTitles = (evidenceTaskData.evidences ?? []).map((evidence) => evidence.title)

  expect(stepEvidenceTitles.filter((title) => title.startsWith('Step ')).length).toBeGreaterThanOrEqual(8)
})
