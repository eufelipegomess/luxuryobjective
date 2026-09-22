import { expect, test } from '@playwright/test'

/** Os breakpoints que o briefing manda testar, mais um ultrawide. */
const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '2560x1200', width: 2560, height: 1200 },
]

const PATHS = ['/', '/empresa', '/servicos', '/projetos', '/contacto', '/projetos/o-luzia']

test.describe('breakpoints', () => {
  // Uma única passagem em Chromium chega: o que se verifica é layout, não motor.
  test.skip(({ isMobile }) => isMobile, 'Corre no projeto desktop, com resize manual')

  for (const viewport of VIEWPORTS) {
    test(`sem overflow horizontal em ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      for (const path of PATHS) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, `${path} @ ${viewport.name}`).toBeLessThanOrEqual(1)
      }
    })
  }

  test('o corpo de texto nunca desce dos 16px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/empresa')

    const tamanhos = await page
      // Só o conteúdo: o rodapé tem texto legal, que vive noutra escala.
      .locator('main p')
      .evaluateAll((nodes) =>
        nodes
          .filter((node) => (node.textContent ?? '').trim().length > 40)
          .map((node) => parseFloat(getComputedStyle(node).fontSize)),
      )

    expect(tamanhos.length).toBeGreaterThan(0)
    for (const tamanho of tamanhos) expect(tamanho).toBeGreaterThanOrEqual(16)
  })

  test('os alvos de toque têm pelo menos 44px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/contacto')

    const alturas = await page
      .locator('main input, main select, main textarea, main button[type="submit"]')
      .evaluateAll((nodes) =>
        nodes
          // O honeypot vive fora do ecrã de propósito: não é um alvo de toque.
          .filter((node) => node.getBoundingClientRect().x >= 0)
          .map((node) => node.getBoundingClientRect().height),
      )

    for (const altura of alturas) expect(altura).toBeGreaterThanOrEqual(44)
  })
})
