import { expect, test } from '@playwright/test'
import {
  captureAndAttachStepEvidence,
  closeTaskWithSpentHours,
  createAuthContext,
  createFrontendEvidenceTask,
  getTaskById,
} from './support/evidence'

test('card do Kanban: id oculto, clique simples nao abre modal, duplo clique abre', async ({ page }, testInfo) => {
  const authContext = await createAuthContext(page.request)
  const evidenceTask = await createFrontendEvidenceTask(
    page.request,
    authContext,
    `[BUG] Card Kanban UX ${Date.now()}`,
    'Valida que o card do Kanban nao mostra o id (guid), que cliques em inputs (spent/status) nao abrem o modal, e que o modal de detalhes so abre em duplo clique na area do card.',
  )

  await page.goto('/login')
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 1, 'pagina de login aberta')

  await page.getByLabel('Email').fill('admin@cmms.local')
  await page.getByLabel('Password').fill('Naotemsenha0(')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app\/home$/)

  await page.getByRole('link', { name: /Kanban/i }).click()
  await expect(page).toHaveURL(/\/app\/kanban$/)
  await expect(page.getByRole('heading', { name: 'Devcraft CMMS - Kanban' })).toBeVisible()
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 2, 'kanban carregado')

  const card = page.locator('[data-testid="kanban-card"]').first()
  await expect(card).toBeVisible()

  const cardText = (await card.innerText()).trim()
  expect(cardText).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 3, 'card sem guid visivel')

  await card.click()
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toHaveCount(0)
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 4, 'clique simples nao abre modal')

  const spentInput = card.locator('input[type="number"]').first()
  await spentInput.click()
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toHaveCount(0)
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 5, 'clique no input spent nao abre modal')

  const statusSelect = card.locator('select').first()
  await statusSelect.click()
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 6, 'clique no dropdown status nao abre modal')

  await card.dblclick()
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toBeVisible()
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 7, 'duplo clique abre modal de detalhes')

  await page.getByRole('button', { name: 'Close', exact: true }).first().click()
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toHaveCount(0)

  await closeTaskWithSpentHours(page.request, evidenceTask, 0.7)

  const task = await getTaskById(page.request, authContext, evidenceTask.taskId)
  const evidenceTitles = (task.evidences ?? []).map((evidence) => evidence.title)
  expect(evidenceTitles.filter((title) => title.startsWith('Step ')).length).toBeGreaterThanOrEqual(7)
})
