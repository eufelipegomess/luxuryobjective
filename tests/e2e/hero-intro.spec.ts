import { expect, test } from '@playwright/test'

/**
 * Intro da hero: na primeira carga da sessão o vídeo aparece parado, avança com
 * o scroll, e perto do fim entram o header e o texto.
 */
test.describe('intro da hero', () => {
  test('o vídeo avança com o scroll e o site entra perto do fim', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute('data-hero-intro', '')
    await expect(page.locator('[data-site-header]')).toHaveCSS('opacity', '0')

    const stage = await page.locator('[data-hero-stage]').boundingBox()
    const viewport = page.viewportSize()?.height ?? 0
    const total = (stage?.height ?? 0) - viewport
    expect(total, 'a hero tem de ter percurso para o vídeo').toBeGreaterThan(viewport)

    // A meio do percurso, o vídeo tem de estar a meio da duração.
    await page.evaluate((y) => window.scrollTo(0, y), total * 0.5)
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const v = document.querySelector('video')
            return v && v.duration ? v.currentTime / v.duration : 0
          }),
        { timeout: 6000 },
      )
      .toBeGreaterThan(0.3)

    // Perto do fim, header e conteúdo entram.
    await page.evaluate((y) => window.scrollTo(0, y), total * 0.9)
    await expect(page.locator('html')).not.toHaveAttribute('data-hero-intro', '')
    await expect(page.locator('[data-site-header]')).toHaveCSS('opacity', '1')
  })

  test('na segunda carga não há intro', async ({ page }) => {
    await page.goto('/')
    const stage = await page.locator('[data-hero-stage]').boundingBox()
    const viewport = page.viewportSize()?.height ?? 0
    await page.evaluate((y) => window.scrollTo(0, y), (stage?.height ?? 0) - viewport)
    await expect(page.locator('html')).not.toHaveAttribute('data-hero-intro', '')

    await page.reload()
    await expect(page.locator('html')).not.toHaveAttribute('data-hero-scrub', '')
    await expect(page.locator('[data-site-header]')).toHaveCSS('opacity', '1')
  })

  test('em reduced motion não há intro nenhuma', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    await expect(page.locator('html')).not.toHaveAttribute('data-hero-intro', '')
    await expect(page.locator('[data-site-header]')).toHaveCSS('opacity', '1')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('a tecla Tab dispensa a intro, para o teclado não ficar preso', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Sem Tab em iOS WebKit')
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-hero-intro', '')

    await page.keyboard.press('Tab')
    await expect(page.locator('html')).not.toHaveAttribute('data-hero-intro', '')
  })
})
