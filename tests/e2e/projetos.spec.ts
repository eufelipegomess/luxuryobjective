import { expect, test } from '@playwright/test'

test.describe('projetos', () => {
  test('filtra por categoria e mantém o histórico', async ({ page }) => {
    await page.goto('/projetos')

    const filtros = page.getByRole('navigation', { name: 'Filtrar projetos' })
    await expect(filtros.getByRole('link', { name: 'Todos' })).toHaveAttribute(
      'aria-current',
      'true',
    )

    await filtros.getByRole('link', { name: 'Remodelação & Reabilitação' }).click()
    await expect(page).toHaveURL(/categoria=remodelacao/)
    await expect(page.getByRole('heading', { name: 'Desenvolvimento Imobiliário' })).toBeHidden()

    // O botão voltar tem de devolver o filtro anterior.
    await page.goBack()
    await expect(page).toHaveURL(/\/projetos$/)
    await expect(page.getByRole('heading', { name: 'Desenvolvimento Imobiliário' })).toBeVisible()
  })

  test('a categoria vazia mostra um estado vazio, não conteúdo inventado', async ({ page }) => {
    await page.goto('/projetos?categoria=remodelacao')
    await expect(page.getByText('Sem projetos publicados nesta categoria.')).toBeVisible()
  })

  test('abre a página dinâmica de um projeto', async ({ page }) => {
    await page.goto('/projetos')

    const primeiro = page.getByRole('link', { name: /O'LUZIA/ }).first()
    await primeiro.click()

    await expect(page).toHaveURL(/\/projetos\/o-luzia$/)
    await expect(page.locator('h1')).toContainText("O'LUZIA")
    await expect(page.getByText('Em execução')).toBeVisible()

    // Breadcrumb funcional de volta à listagem.
    await page.getByRole('navigation', { name: 'Percurso' }).getByRole('link').click()
    await expect(page).toHaveURL(/\/projetos$/)
  })

  test('accordion da Home abre e fecha por teclado', async ({ page }) => {
    await page.goto('/')

    const botao = page.getByRole('button', { name: /MACIEIRA DA MAIA/ })
    await botao.scrollIntoViewIfNeeded()
    await expect(botao).toHaveAttribute('aria-expanded', 'false')

    await botao.focus()
    await page.keyboard.press('Enter')
    await expect(botao).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Enter')
    await expect(botao).toHaveAttribute('aria-expanded', 'false')
  })

  test('apenas um item do accordion fica aberto', async ({ page }) => {
    await page.goto('/')

    const primeiro = page.getByRole('button', { name: /O'LUZIA/ })
    const segundo = page.getByRole('button', { name: /MACIEIRA DA MAIA/ })
    await primeiro.scrollIntoViewIfNeeded()

    await expect(primeiro).toHaveAttribute('aria-expanded', 'true')
    await segundo.click()
    await expect(segundo).toHaveAttribute('aria-expanded', 'true')
    await expect(primeiro).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('reveal ao trocar de filtro', () => {
  test('as capas continuam visíveis depois de alternar categorias', async ({ page }) => {
    // Regressão: o controlador de reveals varria o DOM uma única vez, por isso
    // as capas renderizadas depois de filtrar ficavam com o `clip-path` inicial
    // e só reapareciam com um recarregamento.
    await page.goto('/projetos')

    const filtros = page.getByRole('navigation', { name: 'Filtrar projetos' })
    await filtros.getByRole('link', { name: /Remodelação & Reabilitação/ }).click()
    await expect(page).toHaveURL(/categoria=remodelacao/)

    await filtros.getByRole('link', { name: 'Todos' }).click()
    await expect(page).toHaveURL(/\/projetos$/)

    const capa = page.locator('[data-reveal-media]').first()
    await capa.scrollIntoViewIfNeeded()
    await expect(capa).toBeVisible()

    // `inset(0 0 100% 0)` é o estado escondido; qualquer outro valor serve.
    await expect
      .poll(async () => capa.evaluate((el) => getComputedStyle(el).clipPath), { timeout: 4000 })
      .not.toContain('100%')
  })
})
