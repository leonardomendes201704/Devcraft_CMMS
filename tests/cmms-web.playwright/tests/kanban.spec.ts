import { expect, test } from '@playwright/test'

test('kanban renders and creates task', async ({ page }, testInfo) => {
  const taskTitle = `Validacao E2E Kanban ${Date.now()}`

  await page.goto('/kanban')
  await expect(page.getByRole('heading', { name: 'Devcraft CMMS - Kanban' })).toBeVisible()

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

  await page.screenshot({ path: testInfo.outputPath('kanban-after-create.png'), fullPage: true })

  const afterText = await tasksMetricValue.innerText()
  const after = Number.parseInt(afterText, 10)
  expect(after).toBeGreaterThanOrEqual(before + 1)
})
