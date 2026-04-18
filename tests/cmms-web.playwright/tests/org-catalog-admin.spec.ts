import { expect, test } from '@playwright/test'
import {
  captureAndAttachStepEvidence,
  closeTaskWithSpentHours,
  createAuthContext,
  createFrontendEvidenceTask,
  getTaskById,
} from './support/evidence'

test('department and job catalogs can be managed and assigned to user profile', async ({ page, request }, testInfo) => {
  const authContext = await createAuthContext(request)
  const evidenceTask = await createFrontendEvidenceTask(
    request,
    authContext,
    `[TASK] Playwright department/job catalog flow evidence ${Date.now()}`,
    'Captura passo a passo de cadastro de departamento/cargo e associacao no usuario.',
  )

  const suffix = Date.now()
  const departmentName = `QA Department ${suffix}`
  const departmentCode = `QAD${String(suffix).slice(-4)}`
  const jobName = `QA Job ${suffix}`
  const jobCode = `QAJ${String(suffix).slice(-4)}`

  await page.goto('/login')
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 1, 'open login page')

  await page.getByLabel('Email').fill('admin@cmms.local')
  await page.getByLabel('Password').fill('Naotemsenha0(')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app\/home$/)
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 2, 'authenticated on shell home')

  await page.locator("a[href='/app/admin/departments']").first().click()
  await expect(page).toHaveURL(/\/app\/admin\/departments$/)
  await page.getByRole('link', { name: 'Create department' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/departments\/create$/)
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 3, 'department create form opened')

  await page.getByLabel('Department name').fill(departmentName)
  await page.getByLabel('Department code').fill(departmentCode)
  await page.getByLabel('Department description').fill('Department created by Playwright E2E flow.')
  await page.getByRole('button', { name: 'Create department' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/departments\/.+$/)
  await expect(page.getByText(departmentName)).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 4, 'department created and details visible')

  await page.locator("a[href='/app/admin/jobs']").first().click()
  await expect(page).toHaveURL(/\/app\/admin\/jobs$/)
  await page.getByRole('link', { name: 'Create job' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/jobs\/create$/)
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 5, 'job create form opened')

  await page.getByLabel('Job department').selectOption({ label: departmentName })
  await page.getByLabel('Job name').fill(jobName)
  await page.getByLabel('Job code').fill(jobCode)
  await page.getByLabel('Job description').fill('Job created by Playwright E2E flow.')
  await page.getByRole('button', { name: 'Create job' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/jobs\/.+$/)
  await expect(page.getByText(jobName)).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 6, 'job created and linked to department')

  await page.locator("a[href='/app/admin/users']").first().click()
  await expect(page).toHaveURL(/\/app\/admin\/users$/)
  await page.getByRole('link', { name: 'Edit' }).first().click()
  await expect(page).toHaveURL(/\/app\/admin\/users\/.+\/edit$/)
  await page.getByRole('combobox', { name: 'User department' }).selectOption({ label: departmentName })
  await page.getByRole('combobox', { name: 'User job' }).selectOption({ label: jobName })
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('combobox', { name: 'User department' })).toHaveValue(/.+/)
  await expect(page.getByRole('combobox', { name: 'User job' })).toHaveValue(/.+/)
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 7, 'user profile updated with catalog entities')

  await page.getByRole('link', { name: 'Back to list' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/users$/)
  await page.getByRole('link', { name: 'View' }).first().click()
  await expect(page).toHaveURL(/\/app\/admin\/users\/.+$/)
  await expect(page.getByText(new RegExp(`${jobName}.*${departmentName}|${departmentName}.*${jobName}`))).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 8, 'user details validated with job and department names')

  await closeTaskWithSpentHours(request, evidenceTask, 1.2)
  const evidenceTaskData = await getTaskById(request, authContext, evidenceTask.taskId)
  const stepEvidenceTitles = (evidenceTaskData.evidences ?? []).map((evidence) => evidence.title)
  expect(stepEvidenceTitles.filter((title) => title.startsWith('Step ')).length).toBeGreaterThanOrEqual(8)
})
