import { describe, expect, it } from 'vitest'
import { contacto, empresa, forms, home, projetos, servicos, futurosProjetos } from '@/content/pt-PT'

/**
 * Guarda da copy aprovada.
 *
 * Estes testes existem para que uma alteração acidental ao ficheiro de
 * conteúdo falhe o build em vez de chegar ao site. Cada string aqui é uma
 * transcrição literal do PDF "Copy Institucional v5".
 */
describe('copy aprovada — literal', () => {
  it('hero da Home', () => {
    expect(home.hero.title).toBe('Criamos, transformamos e desenvolvemos espaços com visão.')
    expect(home.hero.primaryCta).toBe('Conheça os nossos projetos')
    expect(home.hero.secondaryCta).toBe('Fale connosco')
  })

  it('números de autoridade', () => {
    expect(home.destaque.stats.map((stat) => stat.value)).toEqual(['6', '+16', '1', '1'])
    expect(home.destaque.stats.map((stat) => stat.label)).toEqual([
      'Anos de atividade',
      'Anos de experiência da liderança',
      'Projeto imobiliário em execução',
      'Projeto em desenvolvimento',
    ])
  })

  it('as duas áreas de atuação', () => {
    expect(home.areas.title).toBe('As nossas áreas de atuação')
    expect(home.areas.blocks.map((block) => block.title)).toEqual([
      'Desenvolvimento Imobiliário',
      'Remodelação & Reabilitação',
    ])
  })

  it('valores da empresa — oito, pela ordem aprovada', () => {
    expect(empresa.mvv.valores).toEqual([
      'Excelência',
      'Rigor',
      'Profissionalismo',
      'Transparência',
      'Compromisso',
      'Inovação',
      'Visão de longo prazo',
      'Criação de valor',
    ])
  })

  it('liderança', () => {
    expect(empresa.lideranca.people.map((person) => `${person.name} | ${person.role}`)).toEqual([
      'Nathalie Ramos Ferreira | Co-CEO & Fundadora',
      'Bruno Carvalho | Co-CEO & Diretor de Operações e Execução',
    ])
  })

  it('contactos', () => {
    expect(contacto.morada).toBe('Rua da Cavadinha, n.º 54, 4570-535 Balazar, Póvoa de Varzim')
    expect(contacto.telefones.map((phone) => phone.label)).toEqual([
      '+351 912 221 025 (Bruno)',
      '+351 252 104 920 (Escritório)',
    ])
    expect(contacto.email.label).toBe('geral@luxuryobjective.com')
  })

  it('próximos projetos', () => {
    expect(projetos.proximos.title).toBe('Próximos Projetos')
    expect(projetos.proximos.body).toBe('Em breve...')
  })

  it('nota das 48h úteis', () => {
    expect(servicos.nota).toContain('48h úteis')
  })

  it('as três opções de futuros projetos', () => {
    expect(futurosProjetos.options.map((option) => option.title)).toEqual([
      'Quero estabelecer uma parceria',
      'Tenho um terreno ou um projeto',
      'Quero conhecer os próximos projetos',
    ])
    expect(futurosProjetos.options.map((option) => option.cta)).toEqual([
      'Quero ser parceiro',
      'Desenvolver um projeto connosco',
      'Conhecer projetos',
    ])
  })

  it('opções de orçamento com o formato de moeda do PDF', () => {
    expect(forms.remodelacao.orcamento).toEqual([
      'Até 15.000 €',
      '15.000 € – 30.000 €',
      '30.000 € – 60.000 €',
      '60.000 € – 100.000 €',
      'Mais de 100.000 €',
    ])
  })
})

describe('copy — português de Portugal', () => {
  const allText = JSON.stringify({ home, empresa, servicos, projetos, contacto, futurosProjetos })

  it('não usa formas do português do Brasil', () => {
    // Gerúndio "-ndo" perifrástico e "time"/"você" seriam os sinais mais óbvios.
    expect(allText).not.toMatch(/\bvocê\b/i)
    expect(allText).not.toMatch(/\bestá a analisar\b.*\bestá analisando\b/i)
    expect(allText).not.toMatch(/\btime\b/i)
  })

  it('não contém notas editoriais do PDF', () => {
    expect(allText).not.toMatch(/PENDENTE/i)
    expect(allText).not.toMatch(/estrutura visual sugerida/i)
    expect(allText).not.toMatch(/aguarda fotografias/i)
    expect(allText).not.toMatch(/resumo de pendências/i)
    expect(allText).not.toMatch(/direciona para a página/i)
  })
})
