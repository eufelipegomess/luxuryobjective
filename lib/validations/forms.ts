import { z } from 'zod'
import { forms, ui } from '@/content/pt-PT'
import { SUBMISSION_KINDS } from '@/lib/types'

/**
 * Schemas partilhados entre cliente e servidor. O mesmo objeto valida o
 * formulário no browser e o corpo do pedido na route handler — nunca há duas
 * versões da mesma regra a divergir.
 *
 * Regra de obrigatoriedade: tudo o que o PDF lista é obrigatório, exceto o que
 * está marcado "(opcional)". Os uploads são sempre opcionais — são anexos de
 * apoio, e bloquear o envio por falta de ficheiro afastaria contactos válidos.
 */

const required = { required_error: ui.campoObrigatorio, invalid_type_error: ui.campoObrigatorio }

const text = (max = 500) =>
  z.string(required).trim().min(1, ui.campoObrigatorio).max(max, ui.campoObrigatorio)

const longText = () => z.string(required).trim().min(1, ui.campoObrigatorio).max(4000)

const optionalText = (max = 4000) => z.string().trim().max(max).optional().or(z.literal(''))

const email = z.string(required).trim().min(1, ui.campoObrigatorio).email(ui.emailInvalido).max(180)

/** Aceita formatos internacionais e nacionais; rejeita lixo. */
const phone = z
  .string(required)
  .trim()
  .min(9, ui.telefoneInvalido)
  .max(24, ui.telefoneInvalido)
  .regex(/^[+\d][\d\s().-]{7,23}$/, ui.telefoneInvalido)

const oneOf = (options: readonly string[]) =>
  z.string(required).refine((value) => options.includes(value), { message: ui.campoObrigatorio })

const fileMeta = z.object({
  path: z.string().min(1),
  name: z.string().min(1).max(255),
  size: z.number().int().nonnegative(),
  type: z.string().min(1).max(120),
})

const files = z.array(fileMeta).max(8).default([])

/** Campo-armadilha: preenchido significa bot. Invisível para o utilizador. */
const honeypot = z.literal('').optional()

// -----------------------------------------------------------------------------
// Orçamento — Remodelação / Reabilitação
// -----------------------------------------------------------------------------
export const remodelacaoSchema = z.object({
  nome: text(160),
  email,
  telemovel: phone,
  localizacao: text(200),
  tipoImovel: oneOf(forms.remodelacao.tipoImovel),
  area: text(60),
  tipoIntervencao: oneOf(forms.remodelacao.tipoIntervencao),
  orcamento: oneOf(forms.remodelacao.orcamento),
  prazo: text(160),
  descricao: longText(),
  ficheiros: files,
  website: honeypot,
})
export type RemodelacaoInput = z.infer<typeof remodelacaoSchema>

// -----------------------------------------------------------------------------
// Apresente o seu Projeto ou Oportunidade — dois passos
// -----------------------------------------------------------------------------
export const oportunidadeStep1Schema = z.object({
  nome: text(160),
  email,
  telemovel: phone,
  perfil: oneOf(forms.oportunidade.perfil),
  objetivo: oneOf(forms.oportunidade.objetivo),
})
export type OportunidadeStep1Input = z.infer<typeof oportunidadeStep1Schema>

const desenvolvimentoStep2 = z.object({
  objetivo: z.literal('Desenvolvimento do projeto'),
  localizacao: text(200),
  tipoProjeto: oneOf(forms.oportunidade.desenvolvimento.tipoProjeto),
  fase: oneOf(forms.oportunidade.desenvolvimento.fase),
  area: text(60),
  valor: text(80),
  objetivoProjeto: longText(),
  descricao: longText(),
  ficheiros: files,
})

const parceriaStep2 = z.object({
  objetivo: z.literal('Parceria estratégica'),
  areaAtividade: oneOf(forms.oportunidade.parceria.areaAtividade),
  tipoParceria: text(200),
  experiencia: text(200),
  portefolio: text(200),
  descricao: longText(),
})

const investimentoStep2 = z.object({
  objetivo: z.literal('Investimento'),
  tipoInvestimento: oneOf(forms.oportunidade.investimento.tipoInvestimento),
  faixa: oneOf(forms.oportunidade.investimento.faixa),
  zona: text(160),
  objetivoInvestimento: longText(),
  mensagem: longText(),
})

const gestaoStep2 = z.object({
  objetivo: z.literal('Gestão e execução da obra'),
  localizacao: text(200),
  tipoObra: text(160),
  estado: oneOf(forms.oportunidade.gestao.estado),
  prazo: text(160),
  valor: text(80),
  descricao: longText(),
})

const comercializacaoStep2 = z.object({
  objetivo: z.literal('Comercialização do empreendimento'),
  nomeEmpreendimento: optionalText(200),
  localizacao: text(200),
  tipologia: text(160),
  unidades: text(40),
  estadoComercial: oneOf(forms.oportunidade.comercializacao.estadoComercial),
  necessidades: longText(),
  ficheiros: files,
})

const viabilidadeStep2 = z.object({
  objetivo: z.literal('Análise de viabilidade / oportunidade'),
  localizacao: text(200),
  analisar: oneOf(forms.oportunidade.viabilidade.analisar),
  informacao: longText(),
  ficheiros: files,
})

const outroStep2 = z.object({
  objetivo: z.literal('Outro'),
  descricao: longText(),
})

/** O Passo 2 muda consoante o objetivo escolhido no Passo 1. */
export const oportunidadeStep2Schema = z.discriminatedUnion('objetivo', [
  desenvolvimentoStep2,
  parceriaStep2,
  investimentoStep2,
  gestaoStep2,
  comercializacaoStep2,
  viabilidadeStep2,
  outroStep2,
])

export const oportunidadeSchema = z.intersection(
  oportunidadeStep1Schema.extend({ website: honeypot }),
  oportunidadeStep2Schema,
)
export type OportunidadeInput = z.infer<typeof oportunidadeSchema>

// -----------------------------------------------------------------------------
// Futuros projetos — três percursos
// -----------------------------------------------------------------------------
export const parceriaSchema = z.object({
  nome: text(160),
  empresa: text(160),
  email,
  telemovel: phone,
  areaAtuacao: oneOf(forms.parceria.areaAtuacao),
  mensagem: longText(),
  website: honeypot,
})
export type ParceriaInput = z.infer<typeof parceriaSchema>

export const terrenoSchema = z.object({
  nome: text(160),
  email,
  telemovel: phone,
  localizacao: text(200),
  area: text(60),
  mensagem: longText(),
  website: honeypot,
})
export type TerrenoInput = z.infer<typeof terrenoSchema>

export const proprietarioSchema = z.object({
  nome: text(160),
  email,
  telemovel: phone,
  // "(opcional)" no PDF.
  mensagem: optionalText(),
  website: honeypot,
})
export type ProprietarioInput = z.infer<typeof proprietarioSchema>

// -----------------------------------------------------------------------------
// Contacto
// -----------------------------------------------------------------------------
export const contactoSchema = z.object({
  nome: text(160),
  email,
  telemovel: phone,
  assunto: oneOf(forms.contacto.assunto),
  mensagem: longText(),
  website: honeypot,
})
export type ContactoInput = z.infer<typeof contactoSchema>

// -----------------------------------------------------------------------------
// Despacho por tipo
// -----------------------------------------------------------------------------
export const submissionKindSchema = z.enum(SUBMISSION_KINDS)

export const schemaByKind = {
  remodelacao: remodelacaoSchema,
  oportunidade: oportunidadeSchema,
  parceria: parceriaSchema,
  terreno: terrenoSchema,
  proprietario: proprietarioSchema,
  contacto: contactoSchema,
} as const

export type SchemaByKind = typeof schemaByKind
