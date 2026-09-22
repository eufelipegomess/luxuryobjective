import { expect, test } from '@playwright/test'

test.describe('menu mobile', () => {
  // O menu full-screen só existe abaixo de lg.
  test.skip(({ isMobile }) => !isMobile, 'Apenas no viewport mobile')

  /**
   * Na primeira carga da Home o header está escondido pela intro da hero.
   * Passar a intro é o que um visitante faz antes de chegar ao menu.
   */
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    const stage = await page.locator('[data-hero-stage]').boundingBox()
    const viewport = page.viewportSize()?.height ?? 0
    await page.evaluate((y) => window.scrollTo(0, y), (stage?.height ?? 0) - viewport)
    await expect(page.locator('html')).not.toHaveAttribute('data-hero-intro', '')
    await page.evaluate(() => window.scrollTo(0, 0))
  })

  test('abre, navega e fecha', async ({ page }) => {
    const opener = page.getByRole('button', { name: 'Menu' })
    await expect(opener).toHaveAttribute('aria-expanded', 'false')
    await opener.tap()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.getByRole('link', { name: 'Empresa', exact: true }).tap()
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(/\/empresa$/)
  })

  test('fecha com o botão Fechar e devolve o foco', async ({ page }) => {
    await page.getByRole('button', { name: 'Menu' }).tap()

    const close = page.getByRole('button', { name: 'Fechar' })
    await expect(close).toBeFocused()
    await close.tap()

    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused()
  })

  test('fecha com Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Menu' }).tap()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('bloqueia o scroll enquanto está aberto', async ({ page }) => {
    await page.getByRole('button', { name: 'Menu' }).tap()

    const position = await page.evaluate(() => document.body.style.position)
    expect(position).toBe('fixed')
  })
})
