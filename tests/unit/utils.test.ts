import { describe, expect, it } from 'vitest'
import { compactMeta, formatBytes, safeFileName, slugify, truncate } from '@/lib/utils'
import { projectSchema } from '@/lib/validations/project'

describe('slugify', () => {
  it('remove diacríticos do português', () => {
    expect(slugify('Remodelação & Reabilitação')).toBe('remodelacao-reabilitacao')
    expect(slugify('Póvoa de Varzim')).toBe('povoa-de-varzim')
  })

  it('trata apóstrofos como no nome do projeto real', () => {
    expect(slugify("O'LUZIA")).toBe('oluzia')
  })

  it('não deixa hífenes soltos nas pontas', () => {
    expect(slugify('  --- Projeto ---  ')).toBe('projeto')
  })

  it('produz sempre um slug aceite pelo schema', () => {
    const slug = slugify('Empreendimento Turístico — Fase 2')
    expect(projectSchema.shape.slug.safeParse(slug).success).toBe(true)
  })
})

describe('safeFileName', () => {
  it('descarta o nome original e mantém só a extensão', () => {
    expect(safeFileName('../../etc/passwd.PNG', 'abc123')).toBe('abc123.png')
  })

  it('usa bin quando não há extensão utilizável', () => {
    expect(safeFileName('ficheiro', 'abc123')).toBe('abc123.bin')
    expect(safeFileName('ficheiro.!!!', 'abc123')).toBe('abc123.bin')
  })
})

describe('compactMeta', () => {
  it('descarta entradas sem valor — o site não mostra labels vazios', () => {
    const items = compactMeta([
      { label: 'Localização', value: 'Balazar' },
      { label: 'Ano', value: null },
      { label: 'Área', value: '  ' },
      { label: 'Tipologia', value: undefined },
    ])
    expect(items.map((item) => item.label)).toEqual(['Localização'])
  })

  it('mantém números, incluindo zero', () => {
    expect(compactMeta([{ label: 'Unidades', value: 0 }])).toHaveLength(1)
  })
})

describe('truncate', () => {
  it('não corta texto que já cabe', () => {
    expect(truncate('curto', 20)).toBe('curto')
  })

  it('corta na fronteira de palavra', () => {
    const result = truncate('A Luxury Objective desenvolve projetos imobiliários', 20)
    expect(result.length).toBeLessThanOrEqual(21)
    expect(result.endsWith('…')).toBe(true)
  })
})

describe('formatBytes', () => {
  it('formata as três escalas', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})

describe('projectSchema', () => {
  const base = {
    title: "O'LUZIA",
    slug: 'o-luzia',
    category: 'desenvolvimento',
    status: 'em-execucao',
  }

  it('aceita o mínimo — o resto do projeto entra depois', () => {
    expect(projectSchema.safeParse(base).success).toBe(true)
  })

  it('rejeita slugs com maiúsculas ou espaços', () => {
    expect(projectSchema.safeParse({ ...base, slug: 'O Luzia' }).success).toBe(false)
    expect(projectSchema.safeParse({ ...base, slug: 'O-Luzia' }).success).toBe(false)
  })

  it('rejeita categorias e estados fora do domínio', () => {
    expect(projectSchema.safeParse({ ...base, category: 'outra' }).success).toBe(false)
    expect(projectSchema.safeParse({ ...base, status: 'pausado' }).success).toBe(false)
  })

  it('valida o formato do focal point', () => {
    expect(projectSchema.safeParse({ ...base, coverFocalPoint: '50% 30%' }).success).toBe(true)
    expect(projectSchema.safeParse({ ...base, coverFocalPoint: 'center' }).success).toBe(false)
  })

  it('só aceita blocos estruturados conhecidos', () => {
    expect(
      projectSchema.safeParse({ ...base, blocks: [{ type: 'paragraph', text: 'Texto.' }] }).success,
    ).toBe(true)
    expect(
      projectSchema.safeParse({ ...base, blocks: [{ type: 'html', text: '<script>' }] }).success,
    ).toBe(false)
  })

  it('rejeita anos impossíveis', () => {
    expect(projectSchema.safeParse({ ...base, year: 1200 }).success).toBe(false)
    expect(projectSchema.safeParse({ ...base, year: 2026 }).success).toBe(true)
  })
})
