import { describe, expect, it } from 'vitest'
import {
  contactoSchema,
  oportunidadeSchema,
  oportunidadeStep1Schema,
  parceriaSchema,
  proprietarioSchema,
  remodelacaoSchema,
  terrenoSchema,
  schemaByKind,
} from '@/lib/validations/forms'
import { SUBMISSION_KINDS } from '@/lib/types'

const contactoBase = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.pt',
  telemovel: '+351 912 000 000',
  assunto: 'informação geral',
  mensagem: 'Gostaria de saber mais sobre os vossos projetos.',
}

describe('contactoSchema', () => {
  it('aceita uma submissão completa', () => {
    expect(contactoSchema.safeParse(contactoBase).success).toBe(true)
  })

  it('rejeita e-mail inválido', () => {
    const result = contactoSchema.safeParse({ ...contactoBase, email: 'maria(at)exemplo' })
    expect(result.success).toBe(false)
  })

  it('rejeita telemóvel com letras', () => {
    const result = contactoSchema.safeParse({ ...contactoBase, telemovel: 'liguem-me' })
    expect(result.success).toBe(false)
  })

  it('rejeita um assunto fora das opções aprovadas', () => {
    const result = contactoSchema.safeParse({ ...contactoBase, assunto: 'reclamação' })
    expect(result.success).toBe(false)
  })

  it('rejeita campos obrigatórios só com espaços', () => {
    const result = contactoSchema.safeParse({ ...contactoBase, nome: '   ' })
    expect(result.success).toBe(false)
  })
})

describe('remodelacaoSchema', () => {
  const base = {
    nome: 'João Costa',
    email: 'joao@exemplo.pt',
    telemovel: '252104920',
    localizacao: 'Póvoa de Varzim',
    tipoImovel: 'Moradia',
    area: '180',
    tipoIntervencao: 'Remodelação total',
    orcamento: '60.000 € – 100.000 €',
    prazo: '6 meses',
    descricao: 'Remodelação integral de moradia.',
  }

  it('aceita sem ficheiros — os anexos são opcionais', () => {
    const result = remodelacaoSchema.safeParse(base)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.ficheiros).toEqual([])
  })

  it('aceita metadados de ficheiros válidos', () => {
    const result = remodelacaoSchema.safeParse({
      ...base,
      ficheiros: [{ path: '2026/abc/x.pdf', name: 'planta.pdf', size: 1024, type: 'application/pdf' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejeita opções fora da lista aprovada', () => {
    expect(remodelacaoSchema.safeParse({ ...base, tipoImovel: 'Barco' }).success).toBe(false)
    expect(remodelacaoSchema.safeParse({ ...base, orcamento: '1 milhão' }).success).toBe(false)
  })
})

describe('oportunidade — dois passos', () => {
  const step1 = {
    nome: 'Ana Dias',
    email: 'ana@exemplo.pt',
    telemovel: '912221025',
    perfil: 'Investidor',
    objetivo: 'Investimento',
  }

  it('valida o Passo 1 isoladamente', () => {
    expect(oportunidadeStep1Schema.safeParse(step1).success).toBe(true)
  })

  it('exige os campos do objetivo escolhido', () => {
    const semStep2 = oportunidadeSchema.safeParse(step1)
    expect(semStep2.success).toBe(false)
  })

  it('aceita o ramo Investimento completo', () => {
    const result = oportunidadeSchema.safeParse({
      ...step1,
      tipoInvestimento: 'Terrenos',
      faixa: '500.000 € – 1M €',
      zona: 'Grande Porto',
      objetivoInvestimento: 'Rentabilidade a médio prazo.',
      mensagem: 'Disponível para reunião.',
    })
    expect(result.success).toBe(true)
  })

  it('não aceita campos de outro ramo', () => {
    const result = oportunidadeSchema.safeParse({
      ...step1,
      // campos de "Parceria estratégica" com objetivo "Investimento"
      areaAtividade: 'Arquitetura',
      tipoParceria: 'Joint venture',
      experiencia: 'Estúdio',
      portefolio: 'https://exemplo.pt',
      descricao: 'Proposta.',
    })
    expect(result.success).toBe(false)
  })

  it('aceita o ramo Outro apenas com descrição', () => {
    const result = oportunidadeSchema.safeParse({
      ...step1,
      objetivo: 'Outro',
      descricao: 'Pretendo apresentar um caso específico.',
    })
    expect(result.success).toBe(true)
  })
})

describe('formulários de futuros projetos', () => {
  it('parceria exige empresa e área de atuação', () => {
    const base = {
      nome: 'Rui Melo',
      empresa: 'Melo Arquitetos',
      email: 'rui@exemplo.pt',
      telemovel: '912345678',
      areaAtuacao: 'Arquitetura',
      mensagem: 'Proposta de colaboração.',
    }
    expect(parceriaSchema.safeParse(base).success).toBe(true)
    expect(parceriaSchema.safeParse({ ...base, empresa: '' }).success).toBe(false)
  })

  it('terreno exige localização e área', () => {
    const base = {
      nome: 'Sofia Reis',
      email: 'sofia@exemplo.pt',
      telemovel: '912345678',
      localizacao: 'Balazar',
      area: '2500',
      mensagem: 'Terreno com viabilidade.',
    }
    expect(terrenoSchema.safeParse(base).success).toBe(true)
    expect(terrenoSchema.safeParse({ ...base, localizacao: '' }).success).toBe(false)
  })

  it('futuro proprietário tem mensagem opcional', () => {
    const base = { nome: 'Nuno Sá', email: 'nuno@exemplo.pt', telemovel: '912345678' }
    expect(proprietarioSchema.safeParse(base).success).toBe(true)
    expect(proprietarioSchema.safeParse({ ...base, mensagem: '' }).success).toBe(true)
  })
})

describe('honeypot', () => {
  it('rejeita o campo-armadilha preenchido', () => {
    const result = contactoSchema.safeParse({ ...contactoBase, website: 'http://spam.example' })
    expect(result.success).toBe(false)
  })

  it('aceita o campo-armadilha vazio ou ausente', () => {
    expect(contactoSchema.safeParse({ ...contactoBase, website: '' }).success).toBe(true)
    expect(contactoSchema.safeParse(contactoBase).success).toBe(true)
  })
})

describe('despacho por tipo', () => {
  it('existe um schema para cada tipo de submissão', () => {
    for (const kind of SUBMISSION_KINDS) {
      expect(schemaByKind[kind]).toBeDefined()
    }
  })
})
