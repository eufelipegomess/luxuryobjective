import { expect, test } from '@playwright/test'

/** As cinco páginas do site, pela ordem da navegação aprovada. */
const PAGES = [
  { path: '/', heading: 'Criamos, transformamos e desenvolvemos espaços com visão.' },
  { path: '/empresa', heading: 'Quem somos' },
  { path: '/servicos', heading: 'Serviços' },
  { path: '/projetos', heading: 'Projetos' },
  { path: '/contacto', heading: 'Fale com a Luxury Objective' },
]

test.describe('navegação', () => {
  for (const page of PAGES) {
    test(`${page.path} carrega com um único h1`, async ({ page: browser }) => {
      const errors: string[] = []
      browser.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })

      await browser.goto(page.path)

      const h1 = browser.locator('h1')
      await expect(h1).toHaveCount(1)
      await expect(h1).toContainText(page.heading)
      expect(errors, `consola limpa em ${page.path}`).toEqual([])
    })

    test(`${page.path} não tem scroll horizontal`, async ({ page: browser }) => {
      await browser.goto(page.path)
      const overflow = await browser.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(1)
    })
  }

  test('percorre as cinco páginas pelo rodapé', async ({ page }) => {
    await page.goto('/')

    for (const target of ['Empresa', 'Serviços', 'Projetos', 'Contacto']) {
      await page
        .getByRole('navigation', { name: 'Navegação do rodapé' })
        .getByRole('link', { name: target, exact: true })
        .click()
      await expect(page.locator('h1')).toHaveCount(1)
    }
  })

  test('o skip link é o primeiro alvo de tabulação', async ({ page, isMobile }) => {
    // O WebKit do iOS não move o foco com Tab (comportamento do sistema), por
    // isso o percurso de teclado é validado no projeto desktop.
    test.skip(isMobile, 'Tabulação não aplicável em iOS WebKit')

    await page.goto('/')
    await page.keyboard.press('Tab')

    const skip = page.getByRole('link', { name: 'Saltar para o conteúdo' })
    await expect(skip).toBeFocused()
    await expect(skip).toHaveAttribute('href', '#conteudo')
  })
})

test.describe('reposição do scroll', () => {
  test('mudar de página abre sempre no topo', async ({ page, isMobile }) => {
    test.skip(isMobile, 'A nav completa do rodapé é validada aqui em desktop')

    // Regressão: com o Lenis a guardar a sua própria posição, a página seguinte
    // abria a meio do documento — muitas vezes já no rodapé.
    await page.goto('/servicos')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500)

    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Projetos', exact: true })
      .click()

    await expect(page).toHaveURL(/\/projetos$/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10)
  })

  test('abrir um projeto abre no topo', async ({ page }) => {
    await page.goto('/projetos')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500)

    await page.getByRole('link', { name: /O'LUZIA/ }).first().click()
    await expect(page).toHaveURL(/\/projetos\/o-luzia$/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10)
  })
})
