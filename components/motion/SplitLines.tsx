'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ElementType } from 'react'
import { prefersReducedMotion, registerGsap } from '@/lib/animations/gsap'

type Props = {
  text: string
  as?: ElementType
  className?: string
  /** Atraso entre linhas. */
  stagger?: number
  delay?: number
}

/**
 * Onde é que o browser partiu o texto.
 *
 * Mede sobre o próprio nó de texto, com um `Range` por palavra, e agrupa pelas
 * palavras que partilham a mesma linha. É a única forma de obter as quebras
 * reais: medir num DOM alternativo — palavras em `inline-block`, por exemplo —
 * dá outro resultado, porque `text-wrap: balance` nos títulos trata caixas e
 * texto corrido de maneira diferente. Essa diferença punha o Safari do
 * telemóvel a devolver linhas de uma palavra só.
 */
function medirLinhas(node: HTMLElement): string[] {
  const texto = node.firstChild
  if (!texto || texto.nodeType !== Node.TEXT_NODE) return []

  const conteudo = (texto as Text).data
  const range = document.createRange()
  const linhas: string[] = []
  const palavra = /\S+/g

  let topoAtual: number | null = null
  let buffer = ''
  let match: RegExpExecArray | null

  while ((match = palavra.exec(conteudo)) !== null) {
    range.setStart(texto, match.index)
    range.setEnd(texto, match.index + match[0].length)

    // Uma palavra pode ocupar dois retângulos se for partida ao meio; o que
    // decide a que linha pertence é onde começa.
    const rect = range.getClientRects()[0]
    if (!rect) continue

    const topo = Math.round(rect.top)
    if (topoAtual === null) topoAtual = topo
    if (topo !== topoAtual) {
      if (buffer.trim()) linhas.push(buffer.trim())
      buffer = ''
      topoAtual = topo
    }
    buffer += `${match[0]} `
  }
  if (buffer.trim()) linhas.push(buffer.trim())

  return linhas
}

/**
 * Split por linha sem plugins pagos.
 *
 * Renderiza no servidor como texto corrido — o conteúdo é sempre legível e
 * selecionável, e o leitor de ecrã lê a frase inteira de uma vez. Só depois de
 * montado, e de as fontes estarem carregadas, é que mede as quebras reais e
 * reagrupa em linhas mascaradas para o reveal. Ao redimensionar, volta a medir.
 *
 * A animação das linhas é feita aqui, e não pelo `RevealController`: só este
 * componente sabe quando é que as linhas existem. Deixar o controlador global
 * varrer o DOM num instante fixo criava uma corrida — se ele passasse antes da
 * medição, a headline ficava mascarada para sempre.
 */
export function SplitLines({ text, as: Tag = 'span', className, stagger = 0.09, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [lines, setLines] = useState<string[] | null>(null)

  // Fase de medição. O DOM medido é exatamente o que o servidor enviou: texto
  // corrido, sem embrulhos. Esperar pelas fontes evita congelar as quebras da
  // fonte de recurso, que tem outra largura.
  useLayoutEffect(() => {
    if (prefersReducedMotion() || lines) return
    const node = ref.current
    if (!node) return

    let cancelado = false
    let frame = 0

    const medir = () => {
      if (cancelado) return
      const node = ref.current
      if (!node) return
      const medidas = medirLinhas(node)
      if (medidas.length > 0) setLines(medidas)
    }

    const agendar = () => {
      frame = requestAnimationFrame(medir)
    }

    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(agendar)
    } else {
      agendar()
    }

    return () => {
      cancelado = true
      cancelAnimationFrame(frame)
    }
  }, [lines, text])

  // Anima as linhas assim que existem.
  useLayoutEffect(() => {
    if (!lines || prefersReducedMotion()) return
    const node = ref.current
    if (!node) return

    const gsap = registerGsap()
    const targets = node.querySelectorAll('span > span')
    if (targets.length === 0) return

    const ctx = gsap.context(() => {
      // Já visível ao carregar? Anima de imediato. Caso contrário espera pelo
      // scroll — sem isto, o que está na primeira dobra podia nunca disparar.
      const inView = node.getBoundingClientRect().top < window.innerHeight

      gsap.to(targets, {
        y: '0%',
        duration: 1.1,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: inView ? undefined : { trigger: node, start: 'top 85%', once: true },
      })
    }, node)

    return () => ctx.revert()
  }, [lines, delay, stagger])

  // Nova medição quando a largura muda — é só dela que dependem as quebras.
  useEffect(() => {
    if (prefersReducedMotion()) return
    let timer: ReturnType<typeof setTimeout>
    let width = window.innerWidth
    const onResize = () => {
      // Em mobile, a barra do browser a aparecer e a desaparecer dispara
      // `resize` com a mesma largura. Remedir aí punha a headline a repetir o
      // reveal sempre que se subia e descia a página.
      if (window.innerWidth === width) return
      width = window.innerWidth
      clearTimeout(timer)
      timer = setTimeout(() => setLines(null), 180)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  if (!lines) {
    return (
      <Tag ref={ref} className={className}>
        {text}
      </Tag>
    )
  }

  return (
    <Tag ref={ref} className={className} data-reveal-line aria-label={text}>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} aria-hidden="true">
          {/* O espaço final mantém o texto correto ao copiar: sem ele, as
              linhas colam-se umas às outras no `textContent`. */}
          <span>{i === lines.length - 1 ? line : `${line} `}</span>
        </span>
      ))}
    </Tag>
  )
}
