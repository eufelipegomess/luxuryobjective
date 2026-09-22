'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ElementType } from 'react'
import { splitWords } from '@/lib/utils'
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
 * Split por linha sem plugins pagos.
 *
 * Renderiza no servidor como texto corrido — o conteúdo é sempre legível e
 * selecionável, e o leitor de ecrã lê a frase inteira de uma vez. Só depois de
 * montado é que mede as quebras reais e reagrupa em linhas mascaradas para o
 * reveal. Ao redimensionar, volta a medir.
 *
 * A animação das linhas é feita aqui, e não pelo `RevealController`: só este
 * componente sabe quando é que as linhas existem. Deixar o controlador global
 * varrer o DOM num instante fixo criava uma corrida — se ele passasse antes da
 * medição, a headline ficava mascarada para sempre.
 */
export function SplitLines({ text, as: Tag = 'span', className, stagger = 0.09, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [lines, setLines] = useState<string[] | null>(null)
  const [measuring, setMeasuring] = useState(false)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    setMeasuring(true)
  }, [])

  // Fase de medição: palavras soltas, agrupadas depois por posição vertical.
  useLayoutEffect(() => {
    if (!measuring) return
    const node = ref.current
    if (!node) return

    const frame = requestAnimationFrame(() => {
      const words = Array.from(node.querySelectorAll<HTMLElement>('[data-word]'))
      if (words.length === 0) return

      const grouped: string[] = []
      let currentTop: number | null = null
      let buffer = ''

      for (const word of words) {
        const top = Math.round(word.offsetTop)
        if (currentTop === null) currentTop = top
        if (top !== currentTop) {
          grouped.push(buffer.trim())
          buffer = ''
          currentTop = top
        }
        buffer += `${word.textContent ?? ''} `
      }
      if (buffer.trim()) grouped.push(buffer.trim())

      setLines(grouped)
      setMeasuring(false)
    })

    return () => cancelAnimationFrame(frame)
  }, [measuring, text])

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
      timer = setTimeout(() => {
        setLines(null)
        setMeasuring(true)
      }, 180)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  if (measuring) {
    return (
      <Tag ref={ref} className={className}>
        {splitWords(text).map((part, i) =>
          part.trim() === '' ? (
            // O espaço tem de vir de uma expressão: o JSX descarta filhos que
            // sejam só whitespace, e o texto ficaria todo colado.
            <span key={i}>{part}</span>
          ) : (
            <span key={i} data-word className="inline-block">
              {part}
            </span>
          ),
        )}
      </Tag>
    )
  }

  if (!lines) {
    return <Tag className={className}>{text}</Tag>
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
