import { expect, test } from '@playwright/test'

/**
 * Painel administrativo.
 *
 * O CRUD completo precisa de um Supabase a correr e de um administrador criado
 * (ver README). Sem `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` no ambiente, esses
 * testes são saltados em vez de falharem — mas o teste de acesso corre sempre,
 * porque a proteção das rotas não pode depender de configuração.
 */
const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD
const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)

test.describe('acesso ao painel', () => {
  test('/admin nunca é servido sem autenticação', async ({ page }) => {
    const response = await page.goto('/admin')

    if (!supabaseConfigured) {
      // Sem Supabase o painel fecha-se com 503 em vez de renderizar.
      expect(response?.status()).toBe(503)
      return
    }

    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('o robots.txt bloqueia /admin', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.ok()).toBe(true)
    expect(await response.text()).toContain('Disallow: /admin')
  })
})

test.describe('gestão de projetos', () => {
  test.skip(
    !supabaseConfigured || !email || !password,
    'Requer Supabase e E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('E-mail').fill(email!)
    await page.getByLabel('Palavra-passe').fill(password!)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/admin$/)
  })

  test('credenciais erradas não revelam se a conta existe', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('E-mail').fill('inexistente@exemplo.pt')
    await page.getByLabel('Palavra-passe').fill('errada')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('alert')).toHaveText('Credenciais inválidas.')
  })

  test('cria, edita e publica um projeto', async ({ page }) => {
    const titulo = `Teste E2E ${Date.now()}`

    await page.goto('/admin/projetos/novo')
    await page.getByLabel('Título').fill(titulo)
    await page.getByLabel('Categoria').selectOption('remodelacao')
    await page.getByLabel('Estado').selectOption('concluido')
    await page.getByLabel('Descrição breve').fill('Projeto criado por teste automático.')
    await page.getByLabel('Publicado').check()
    await page.getByRole('button', { name: 'Criar projeto' }).click()

    await expect(page).toHaveURL(/\/admin\/projetos$/)
    await expect(page.getByRole('link', { name: titulo })).toBeVisible()

    // Aparece no site público, na categoria certa.
    await page.goto('/projetos?categoria=remodelacao')
    await expect(page.getByRole('heading', { name: titulo })).toBeVisible()

    // Despublicar retira-o.
    await page.goto('/admin/projetos')
    const linha = page.locator('li', { hasText: titulo })
    await linha.getByRole('button', { name: 'Despublicar' }).click()
    await expect(linha.getByRole('button', { name: 'Publicar' })).toBeVisible()

    // Limpeza.
    await linha.getByRole('button', { name: 'Eliminar' }).click()
    await linha.getByRole('button', { name: 'Confirmar eliminação' }).click()
    await expect(page.getByRole('link', { name: titulo })).toHaveCount(0)
  })
})
