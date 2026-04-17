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
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 4, 'user admin page opened')

  await page.getByLabel('Create email').fill(testEmail)
  await page.getByLabel('Create initial password').fill('QaFlowPassw0rd!')
  await page.getByLabel('Create role').selectOption('admin')
  await page.getByRole('button', { name: 'Create user' }).click()
  await expect(page.getByText(testEmail)).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 5, 'user created and listed')

  const userCard = page.locator('article', { hasText: testEmail }).first()
  await userCard.getByLabel(`User role ${testEmail}`).selectOption('technician')
  await expect(userCard.getByLabel(`User role ${testEmail}`)).toHaveValue('technician')
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 6, 'user role updated')

  await userCard.getByLabel(`Reset password ${testEmail}`).fill('QaFlowPassw0rd!2')
  await userCard.getByRole('button', { name: 'Reset password' }).click()
  await expect(userCard.getByLabel(`Reset password ${testEmail}`)).toHaveValue('')
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 7, 'password reset completed')

  await closeTaskWithSpentHours(request, evidenceTask, 0.8)

  const evidenceTaskData = await getTaskById(request, authContext, evidenceTask.taskId)
  const stepEvidenceTitles = (evidenceTaskData.evidences ?? []).map((evidence) => evidence.title)

  expect(stepEvidenceTitles.filter((title) => title.startsWith('Step ')).length).toBeGreaterThanOrEqual(7)
})
