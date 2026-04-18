import { expect, test } from '@playwright/test'
import {
  captureAndAttachStepEvidence,
  closeTaskWithSpentHours,
  createAuthContext,
  createFrontendEvidenceTask,
  getTaskById,
} from './support/evidence'

const evidenceSegment = 'org-catalog'

test('departamentos, cargos e perfil de usuario — fluxo completo E2E + evidencias', async ({ page, request }, testInfo) => {
  const authContext = await createAuthContext(request)
  const evidenceTask = await createFrontendEvidenceTask(
    request,
    authContext,
    `[TASK] Regressao E2E catalogo org + perfil ${Date.now()}`,
    'CRUD departamento e cargo no front, edicao, associacao ao usuario; evidencias em public/evidences/regression/org-catalog/.',
  )

  const suffix = Date.now()
  const departmentName = `QA Department ${suffix}`
  const departmentCode = `QAD${String(suffix).slice(-4)}`
  const jobName = `QA Job ${suffix}`
  const jobCode = `QAJ${String(suffix).slice(-4)}`
  const deptDescUpdated = `Dept atualizado E2E ${suffix}`
  const jobDescUpdated = `Job atualizado E2E ${suffix}`

  await page.goto('/login')
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 1, 'open login page', { segment: evidenceSegment })

  await page.getByLabel('Email').fill('admin@cmms.local')
  await page.getByLabel('Password').fill('Naotemsenha0(')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app\/home$/)
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 2, 'authenticated on shell home', {
    segment: evidenceSegment,
  })

  await page.locator("a[href='/app/admin/departments']").first().click()
  await expect(page).toHaveURL(/\/app\/admin\/departments$/)
  await page.getByRole('link', { name: 'Create department' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/departments\/create$/)
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 3, 'department create form opened', {
    segment: evidenceSegment,
  })

  await page.getByLabel('Department name').fill(departmentName)
  await page.getByLabel('Department code').fill(departmentCode)
  await page.getByLabel('Department description').fill('Department created by Playwright E2E flow.')
  await page.getByRole('button', { name: 'Create department' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/departments\/.+$/)
  await expect(page.getByText(departmentName)).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 4, 'department created and details visible', {
    segment: evidenceSegment,
  })

  await page.getByRole('link', { name: 'Edit department' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/departments\/.+\/edit$/)
  await page.getByLabel('Department description').fill(deptDescUpdated)
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByLabel('Department description')).toHaveValue(deptDescUpdated, { timeout: 20000 })
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 5, 'department edited and description saved', {
    segment: evidenceSegment,
  })

  await page.locator("a[href='/app/admin/jobs']").first().click()
  await expect(page).toHaveURL(/\/app\/admin\/jobs$/)
  await page.getByRole('link', { name: 'Create job' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/jobs\/create$/)
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 6, 'job create form opened', { segment: evidenceSegment })

  await page.getByLabel('Job department').selectOption({ label: departmentName })
  await page.getByLabel('Job name').fill(jobName)
  await page.getByLabel('Job code').fill(jobCode)
  await page.getByLabel('Job description').fill('Job created by Playwright E2E flow.')
  await page.getByRole('button', { name: 'Create job' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/jobs\/.+$/)
  await expect(page.getByText(jobName)).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 7, 'job created and linked to department', {
    segment: evidenceSegment,
  })

  await page.getByRole('link', { name: 'Edit job' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/jobs\/.+\/edit$/)
  await page.getByLabel('Job description').fill(jobDescUpdated)
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByLabel('Job description')).toHaveValue(jobDescUpdated, { timeout: 20000 })
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 8, 'job edited and description saved', { segment: evidenceSegment })

  await page.locator("a[href='/app/admin/users']").first().click()
  await expect(page).toHaveURL(/\/app\/admin\/users$/)
  await page.getByRole('link', { name: 'Edit' }).first().click()
  await expect(page).toHaveURL(/\/app\/admin\/users\/.+\/edit$/)
  await page.getByRole('combobox', { name: 'User department' }).selectOption({ label: departmentName })
  await page.getByRole('combobox', { name: 'User job' }).selectOption({ label: jobName })
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('combobox', { name: 'User department' })).toHaveValue(/.+/)
  await expect(page.getByRole('combobox', { name: 'User job' })).toHaveValue(/.+/)
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 9, 'user profile updated with catalog entities', {
    segment: evidenceSegment,
  })

  await page.getByRole('link', { name: 'Back to list' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/users$/)
  await page.getByRole('link', { name: 'View' }).first().click()
  await expect(page).toHaveURL(/\/app\/admin\/users\/.+$/)
  await expect(page.getByText(new RegExp(`${jobName}.*${departmentName}|${departmentName}.*${jobName}`))).toBeVisible()
  await captureAndAttachStepEvidence(request, page, testInfo, evidenceTask, 10, 'user details validated with job and department names', {
    segment: evidenceSegment,
  })

  await closeTaskWithSpentHours(request, evidenceTask, 2)
  const evidenceTaskData = await getTaskById(request, authContext, evidenceTask.taskId)
  const stepEvidenceTitles = (evidenceTaskData.evidences ?? []).map((evidence) => evidence.title)
  expect(stepEvidenceTitles.filter((title) => title.startsWith('Step ')).length).toBeGreaterThanOrEqual(10)
})
