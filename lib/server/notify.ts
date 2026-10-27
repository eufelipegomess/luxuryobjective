import 'server-only'
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

/** Tem de ser um domínio verificado na Resend, senão a API recusa. */
const REMETENTE = 'Site Luxury Objective <formularios@luxuryobjective.com>'

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
    from: REMETENTE,
    to: [DESTINO],
    subject: `${nome} — ${ASSUNTO[kind]}`,
    text: corpo,
    ...(email ? { reply_to: email } : {}),
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
  const chave = process.env.RESEND_API_KEY
  if (!chave) {
    console.warn('[forms] RESEND_API_KEY não definida — submissão gravada, sem aviso por e-mail')
    return
  }

  try {
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(emailDeSubmissao(kind, payload, ficheiros)),
    })
    if (!resposta.ok) {
      console.error('[forms] e-mail de aviso recusado', resposta.status, await resposta.text())
    }
  } catch (erro) {
    console.error('[forms] e-mail de aviso falhou', erro)
  }
}
