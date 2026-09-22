import { expect, test } from '@playwright/test'

test.describe('formulários', () => {
  test('os dois percursos de Serviços não aparecem ao mesmo tempo', async ({ page }) => {
    await page.goto('/servicos')

    const grupo = page.getByRole('radiogroup', { name: 'Orçamentos & Oportunidades' })
    await grupo.scrollIntoViewIfNeeded()

    // Antes da escolha não há formulário nenhum.
    await expect(page.getByRole('button', { name: 'Solicitar orçamento' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Apresentar oportunidade' })).toHaveCount(0)

    await grupo.getByRole('radio', { name: /Remodelação \/ Reabilitação/ }).click()
    await expect(page.getByRole('button', { name: 'Solicitar orçamento' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Seguinte' })).toHaveCount(0)

    await grupo.getByRole('radio', { name: /Apresente o seu Projeto ou Oportunidade/ }).click()
    await expect(page.getByRole('button', { name: 'Solicitar orçamento' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Seguinte' })).toBeVisible()
  })

  test('os seletores navegam por setas', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Navegação por teclado é validada em desktop')
    await page.goto('/servicos')

    const grupo = page.getByRole('radiogroup', { name: 'Orçamentos & Oportunidades' })
    await grupo.scrollIntoViewIfNeeded()

    const primeiro = grupo.getByRole('radio').first()
    await primeiro.focus()
    await page.keyboard.press('ArrowRight')

    await expect(grupo.getByRole('radio').nth(1)).toHaveAttribute('aria-checked', 'true')
  })

  test('mostra erros nos campos obrigatórios', async ({ page }) => {
    await page.goto('/contacto')

    await page.getByRole('button', { name: 'Enviar mensagem' }).click()

    await expect(page.getByText('Campo obrigatório.').first()).toBeVisible()
    await expect(page.getByLabel('Nome', { exact: true })).toHaveAttribute('aria-invalid', 'true')
  })

  test('valida o formato do e-mail', async ({ page }) => {
    await page.goto('/contacto')

    await page.getByLabel('E-mail').fill('nao-e-um-email')
    await page.getByLabel('Telemóvel').click()

    await expect(page.getByText('Indique um e-mail válido.')).toBeVisible()
  })

  test('o formulário de dois passos avança, volta e preserva o que já foi escrito', async ({
    page,
  }) => {
    await page.goto('/servicos')

    const grupo = page.getByRole('radiogroup', { name: 'Orçamentos & Oportunidades' })
    await grupo.scrollIntoViewIfNeeded()
    await grupo.getByRole('radio', { name: /Apresente o seu Projeto ou Oportunidade/ }).click()

    await expect(page.getByText('Passo 1 de 2')).toBeVisible()

    // Passo 1 incompleto não avança.
    await page.getByRole('button', { name: 'Seguinte' }).click()
    await expect(page.getByText('Passo 1 de 2')).toBeVisible()

    await page.getByLabel('Nome', { exact: true }).fill('Ana Dias')
    await page.getByLabel('E-mail').fill('ana@exemplo.pt')
    await page.getByLabel('Telemóvel').fill('912221025')
    await page.getByLabel('Perfil').selectOption('Investidor')
    await page.getByLabel('Objetivo principal').selectOption('Investimento')

    // Avança por teclado. No WebKit móvel, o clique por coordenadas logo a
    // seguir a `selectOption` cai no elemento errado — o seletor nativo ainda
    // está a fechar-se. Enter é um percurso real, determinístico, e valida de
    // caminho que o passo avança sem rato.
    await page.getByRole('button', { name: 'Seguinte' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByText('Passo 2 de 2')).toBeVisible()

    // Só os campos do objetivo escolhido.
    await expect(page.getByLabel('Faixa de investimento disponível')).toBeVisible()
    await expect(page.getByLabel('Área de atividade')).toHaveCount(0)

    await page.getByRole('button', { name: 'Anterior' }).click()
    await expect(page.getByText('Passo 1 de 2')).toBeVisible()
    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Ana Dias')
    await expect(page.getByLabel('E-mail')).toHaveValue('ana@exemplo.pt')
  })

  test('a área de futuros projetos revela um formulário de cada vez', async ({ page }) => {
    await page.goto('/projetos#futuros-projetos')

    const grupo = page.getByRole('radiogroup', { name: 'Quer fazer parte de um projeto?' })
    await grupo.scrollIntoViewIfNeeded()

    await grupo.getByRole('radio', { name: /Quero estabelecer uma parceria/ }).click()
    await expect(page.getByRole('button', { name: 'Quero ser parceiro' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Conhecer projetos' })).toHaveCount(0)

    await grupo.getByRole('radio', { name: /Quero conhecer os próximos projetos/ }).click()
    await expect(page.getByRole('button', { name: 'Conhecer projetos' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Quero ser parceiro' })).toHaveCount(0)
  })
})
