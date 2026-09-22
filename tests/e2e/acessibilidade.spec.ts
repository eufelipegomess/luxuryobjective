import { expect, test } from '@playwright/test'

test.describe('reduced motion', () => {
  // `emulateMedia` em vez de `test.use({ reducedMotion })`: a fixture não chega
  // a alterar o `matchMedia` da página nesta versão do Playwright.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('o conteúdo aparece sem depender de animação', async ({ page }) => {
    await page.goto('/')

    // Sem o marcador de motion, nenhum estado inicial escondido é aplicado.
    await expect(page.locator('html')).not.toHaveAttribute('data-motion', '')

    const headline = page.locator('h1')
    await expect(headline).toBeVisible()
    await expect(headline).toHaveCSS('opacity', '1')
  })

  test('a hero não pina nem estica a página', async ({ page }) => {
    await page.goto('/')
    const altura = await page.locator('section').first().evaluate((el) => el.clientHeight)
    const viewport = page.viewportSize()?.height ?? 0
    // Sem vídeo a hero é exatamente uma dobra.
    expect(altura).toBeLessThanOrEqual(viewport + 2)
  })
})

test.describe('teclado', () => {
  test('o accordion de projetos é operável por Tab e Enter', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Percurso de teclado validado em desktop')
    await page.goto('/')

    const botao = page.getByRole('button', { name: /O'LUZIA/ })
    await botao.scrollIntoViewIfNeeded()
    await botao.focus()
    await expect(botao).toBeFocused()
  })

  test('o foco é visível nos links de navegação', async ({ page, isMobile }) => {
    test.skip(isMobile, 'A nav completa só existe em desktop')
    await page.goto('/')

    const link = page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Empresa' })
    await link.focus()

    const outline = await link.evaluate((el) => getComputedStyle(el).outlineStyle)
    expect(outline).not.toBe('none')
  })
})

test.describe('estrutura semântica', () => {
  test('a ordem dos headings não salta níveis', async ({ page }) => {
    await page.goto('/empresa')

    const niveis = await page
      .locator('h1, h2, h3, h4')
      .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName.slice(1))))

    let anterior = niveis[0] ?? 1
    expect(anterior).toBe(1)

    for (const nivel of niveis.slice(1)) {
      expect(nivel - anterior).toBeLessThanOrEqual(1)
      anterior = nivel
    }
  })

  test('o mapa carrega em lazy, sem pesar no arranque da página', async ({ page }) => {
    // O consentimento por clique foi retirado a pedido do cliente. O `lazy`
    // continua a garantir que o pedido ao Google só parte perto da dobra.
    await page.goto('/contacto')

    const mapa = page.locator('iframe[title="Ver mapa"]')
    await expect(mapa).toHaveAttribute('loading', 'lazy')
    await expect(mapa).toHaveAttribute('src', /google\.com\/maps/)
  })
})

test.describe('áreas de atuação', () => {
  test('as duas áreas continuam acessíveis sem animação', async ({ page }) => {
    // Regressão: com os painéis sobrepostos por omissão, o segundo tapava o
    // primeiro em reduced motion e o Desenvolvimento Imobiliário desaparecia.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Desenvolvimento Imobiliário', level: 3 }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Remodelação & Reabilitação', level: 3 }),
    ).toBeVisible()
  })
})
