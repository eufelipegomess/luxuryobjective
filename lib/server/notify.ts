import 'server-only'
import nodemailer from 'nodemailer'
import { forms } from '@/content/pt-PT'
import { formatBytes } from '@/lib/utils'
import type { SubmissionFile, SubmissionKind } from '@/lib/types'

/**
 * Avisa a equipa por e-mail de cada formulário submetido.
 *
 * As submissões ficam na base de dados, mas ninguém vive no painel: sem este
 * aviso um pedido podia esperar dias. O e-mail leva o formulário inteiro em
 * texto e o Reply-To de quem o preencheu — responder é carregar em «Responder».
 *
 * Os ficheiros não vão em anexo: estão num bucket privado e só o painel os
 * abre. Vai a lista, para se saber que existem.
 *
 * Sai pelo SMTP do e-mail do domínio, na Hostinger, e não por um serviço de
 * envio à parte: a caixa já existe, o SPF do domínio já aponta para lá — é o
 * que dá ao e-mail a melhor hipótese de não cair no spam — e nada do que o
 * visitante escreve sai da União Europeia.
 */

/** Caixa interna da equipa. Não é a morada pública — essa é a do siteConfig. */
const DESTINO = 'equipaaluxury@gmail.com'

/** Como cada formulário se anuncia no assunto. Nem todos têm título próprio. */
const ASSUNTO: Record<SubmissionKind, string> = {
  remodelacao: 'Orçamento de remodelação',
  oportunidade: 'Projeto ou oportunidade',
  parceria: 'Proposta de parceria',
  terreno: 'Terreno apresentado',
  proprietario: 'Proprietário interessado',
  contacto: 'Contacto pelo site',
}

/**
 * A caixa que envia. Tem de ser a mesma que autentica no SMTP: a Hostinger
 * recusa um remetente diferente de quem entrou na sessão.
 */
const REMETENTE = process.env.SMTP_USER ?? 'geral@luxuryobjective.com'

/**
 * As etiquetas que o visitante viu, para o e-mail falar a mesma língua do
 * formulário. Vivem espalhadas pelo `content/pt-PT.ts` — cada percurso do
 * «oportunidade» tem as suas — por isso recolhem-se todas de uma vez.
 */
function etiquetas(kind: SubmissionKind): Record<string, string> {
  const todas: Record<string, string> = {}
  const recolher = (valor: unknown) => {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return
    for (const [chave, dentro] of Object.entries(valor)) {
      if (chave === 'labels') Object.assign(todas, dentro)
      else recolher(dentro)
    }
  }
  recolher(forms[kind])
  return todas
}

export function emailDeSubmissao(
  kind: SubmissionKind,
  payload: Record<string, unknown>,
  ficheiros: SubmissionFile[],
) {
  const rotulos = etiquetas(kind)
  const linhas = Object.entries(payload)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([campo, valor]) => `${rotulos[campo] ?? campo}: ${String(valor)}`)

  const nome = typeof payload.nome === 'string' ? payload.nome : 'Sem nome'
  const email = typeof payload.email === 'string' ? payload.email : undefined

  const corpo = [
    ASSUNTO[kind],
    '',
    ...linhas,
    ...(ficheiros.length
      ? [
          '',
          `${ficheiros.length} ficheiro(s) em anexo — descarregue no painel, em /admin:`,
          ...ficheiros.map((f) => `  ${f.name} (${formatBytes(f.size)})`),
        ]
      : []),
    '',
    `Recebido em ${new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}.`,
  ].join('\n')

  return {
    from: `Site Luxury Objective <${REMETENTE}>`,
    to: DESTINO,
    subject: `${nome} — ${ASSUNTO[kind]}`,
    text: corpo,
    ...(email ? { replyTo: email } : {}),
  }
}

/**
 * Nunca lança. O formulário já está gravado quando isto corre; falhar o aviso
 * não pode transformar uma submissão guardada num erro para quem a enviou.
 */
export async function notificarSubmissao(
  kind: SubmissionKind,
  payload: Record<string, unknown>,
  ficheiros: SubmissionFile[],
) {
  const palavraPasse = process.env.SMTP_PASSWORD
  if (!palavraPasse) {
    console.warn('[forms] SMTP_PASSWORD não definida — submissão gravada, sem aviso por e-mail')
    return
  }

  try {
    const transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: { user: REMETENTE, pass: palavraPasse },
    })
    await transporte.sendMail(emailDeSubmissao(kind, payload, ficheiros))
  } catch (erro) {
    console.error('[forms] e-mail de aviso falhou', erro)
  }
}
