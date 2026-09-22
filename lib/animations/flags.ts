/**
 * Flags de movimento do documento.
 *
 * Os três atributos (`data-motion`, `data-hero-scrub`, `data-hero-intro`) são
 * escritos no <html> antes da hidratação, pelo script em `app/layout.tsx`: o
 * CSS precisa deles logo no primeiro pixel pintado, senão há um salto.
 *
 * O problema é que o React pode voltar a renderizar o <html> do zero. Basta uma
 * hidratação falhada em qualquer ponto da árvore — e a Netlify provoca uma, ao
 * injectar no <head> duas <meta> (`hosting-provider`, `netlify-deploy`) que o
 * servidor nunca renderizou. Nessa re-renderização o React reescreve o <html>
 * apenas com os atributos que conhece, e os nossos desaparecem.
 *
 * Sem eles o site fica inerte: nenhum reveal dispara, a hero perde a altura de
 * scrub e o vídeo nunca avança.
 *
 * Por isso a decisão passou a viver aqui: é tomada uma vez por carga e pode ser
 * reaplicada a seguir à hidratação. `ensureMotionFlags()` é idempotente e não
 * depende da ordem por que os efeitos correm.
 */

const INTRO_SEEN_KEY = 'lo:hero-intro'

type Flags = { motion: boolean; scrub: boolean }

let flags: Flags | null = null
let introEnded = false

/** Decide uma única vez por carga da página. */
function decide(): Flags {
  if (flags) return flags

  let motion = false
  try {
    motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    /* sem matchMedia não há movimento — o conteúdo continua visível */
  }

  let scrub = false
  try {
    scrub =
      motion && window.location.pathname === '/' && !sessionStorage.getItem(INTRO_SEEN_KEY)
  } catch {
    /* navegação privada: sem intro, e não faz mal */
  }

  flags = { motion, scrub }
  return flags
}

/**
 * Repõe os atributos no <html>. Segura para chamar as vezes que forem precisas,
 * de qualquer componente, em qualquer altura.
 */
export function ensureMotionFlags(): void {
  if (typeof document === 'undefined') return

  const { motion, scrub } = decide()
  const root = document.documentElement

  if (motion) root.setAttribute('data-motion', '')

  if (scrub) {
    // O scrub fica até ao fim da visita: removê-lo encolheria a página debaixo
    // dos pés de quem está a percorrê-la.
    root.setAttribute('data-hero-scrub', '')
    // A intro, essa, não volta depois de ter saído.
    if (!introEnded) root.setAttribute('data-hero-intro', '')
  }
}

/** Esta carga corre a intro conduzida pelo scroll? */
export function heroScrubEnabled(): boolean {
  ensureMotionFlags()
  return decide().scrub
}

/** Retira a intro: header e texto entram, e não volta a correr nesta sessão. */
export function endHeroIntro(): void {
  introEnded = true

  const root = document.documentElement
  if (!root.hasAttribute('data-hero-intro')) return
  root.removeAttribute('data-hero-intro')

  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1')
  } catch {
    /* navegação privada: a intro repete-se na próxima carga, e não faz mal */
  }
}
