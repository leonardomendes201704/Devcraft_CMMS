import { expect, test } from '@playwright/test'
import { captureAndAttachStepEvidence, createAuthContext, type EvidenceTaskContext } from './support/evidence'

/**
 * Optional: anexa imagem à task da entrega UX; defina KANBAN_UX_TASK_ID ao rodar uma vez com a API ativa.
 * O fechamento da task continua via task.ps1 (resolve/close).
 */
test('kanban: faixa de aviso oculta quando nao ha erro; sem Saving ao editar card', async ({ page }, testInfo) => {
  const taskId = process.env.KANBAN_UX_TASK_ID
  test.skip(!taskId, 'Define KANBAN_UX_TASK_ID para anexar evidencia a uma task existente.')

  const authContext = await createAuthContext(page.request)
  const evidenceTask: EvidenceTaskContext = { ...authContext, taskId }

  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@cmms.local')
  await page.getByLabel('Password').fill('Naotemsenha0(')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app\/home$/)
  await page.getByRole('link', { name: /Kanban/i }).click()
  await expect(page).toHaveURL(/\/app\/kanban$/)
  await expect(page.getByRole('heading', { name: 'Devcraft CMMS - Kanban' })).toBeVisible()

  await expect(page.getByTestId('kanban-notice-banner')).toHaveCount(0)

  const card = page.locator('[data-testid="kanban-card"]').first()
  await expect(card).toBeVisible()

  const spentInput = card.locator('input[type="number"]').first()
  await spentInput.fill('1.5')
  await spentInput.blur()
  await page.waitForLoadState('networkidle')

  await expect(page.getByTestId('kanban-notice-banner')).toHaveCount(0)
  await captureAndAttachStepEvidence(page.request, page, testInfo, evidenceTask, 1, 'kanban sem faixa vazia nem Saving apos spent')
})
