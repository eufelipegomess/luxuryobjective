'use client'

import { useEffect, useRef, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { MediaSlot } from '@/components/ui/MediaSlot'
import { SplitLines } from '@/components/motion/SplitLines'
import { media } from '@/lib/media'
import { routes } from '@/lib/config'
import { home } from '@/content/pt-PT'
import {
  registerGsap,
  ScrollTrigger,
  prefersReducedMotion,
  hasFinePointer,
} from '@/lib/animations/gsap'
import { endHeroIntro, heroScrubEnabled } from '@/lib/animations/flags'

/**
 * Partes do percurso da hero, de 0 a 1:
 * - até VIDEO_END o vídeo corre do primeiro ao último frame, sem nada por cima;
 * - entre VIDEO_END e REVEAL_AT a imagem final fica limpa, um instante;
 * - em REVEAL_AT entram o header, o texto e o véu, já sobre a imagem final.
 * Antes o texto entrava aos 72% com o vídeo a meio e tapava os últimos ~2 s.
 */
const VIDEO_END = 0.78
const REVEAL_AT = 0.88

/**
 * Ecrãs em retrato recebem o vídeo vertical (recorte 9:16 do 4K). A mesma regra
 * serve as fontes do vídeo, o poster em `<picture>` e o poster do `<video>`.
 */
const PORTRAIT = '(max-aspect-ratio: 3/4)'

/**
 * Hero da Home — componente prioritário, montado a partir da direção aprovada
 * pelo cliente.
 *
 * Na primeira carga da sessão corre uma intro: o vídeo aparece parado no
 * primeiro frame, avança conforme o scroll, e perto do fim entram o header e o
 * texto. Nas visitas seguintes a hero é uma dobra normal, com o poster e o
 * conteúdo à vista de imediato.
 *
 * O que decide qual dos dois é o `data-hero-scrub` no <html>, escrito antes da
 * hidratação (ver `app/layout.tsx`). Em `prefers-reduced-motion` e sem
 * JavaScript nunca é escrito, portanto não há intro nenhuma.
 *
 * A caixa alta da headline e do subtítulo é deliberada: a hero aprovada usa-a e
 * prevalece sobre a regra geral do briefing. A copy nunca muda — a caixa é só
 * apresentação (text-transform).
 */
export function Hero() {
  return (
    <section data-hero-stage className="relative" aria-label={home.hero.title}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <HeroMedia />

        {/* Proteção de contraste: véu no topo para a nav, gradiente na base
            para o bloco de texto. Entram com o conteúdo — durante a intro só
            escureceriam o vídeo sem nada para proteger. */}
        <div
          aria-hidden="true"
          data-hero-veil
          className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/55 to-transparent"
        />
        <div
          aria-hidden="true"
          data-hero-veil
          className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-ink via-ink/70 to-transparent"
        />

        <HeroContent />
      </div>
    </section>
  )
}

function HeroContent() {
  return (
    <div data-hero-content className="absolute inset-x-0 bottom-0 pb-10 md:pb-14 lg:pb-20">
      <div className="shell">
        {/* A largura em `ch` é o que mantém a headline em duas linhas a partir
            de tablet, em vez de a deixar partir ao sabor da viewport. Como o
            `ch` acompanha o tamanho da letra, reduzir a escala em desktop não
            muda onde a linha parte. À escala geral de `text-display` a
            headline enchia quase o ecrã. */}
        <h1 className="text-display max-w-[20ch] uppercase text-bone md:max-w-[28ch] lg:max-w-[32ch] lg:text-[clamp(2rem,2.9vw,3rem)]">
          <SplitLines text={home.hero.title} as="span" stagger={0.1} delay={0.15} />
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:mt-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <p
            data-reveal
            data-delay="0.5"
            className="max-w-[62ch] text-eyebrow leading-[1.85] text-bone lg:max-w-none lg:flex-1"
          >
            {home.hero.subtitle}
          </p>

          <div
            data-reveal
            data-delay="0.6"
            className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0"
          >
            <ButtonLink href={routes.projetos} variant="primary" withArrow magnetic>
              {home.hero.primaryCta}
            </ButtonLink>
            <ButtonLink href={routes.contacto} variant="secondary">
              {home.hero.secondaryCta}
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mídia da hero.
 *
 * Com scrub: `currentTime` é conduzido pelo progresso do ScrollTrigger, com uma
 * única escrita em voo de cada vez — é o que evita os saltos do Safari.
 * Sem scrub, ou em reduced motion, fica o primeiro frame parado.
 */
function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const source = media.heroVideo

  // Parallax leve no poster quando não há vídeo nenhum configurado.
  useEffect(() => {
    if (source.src !== null) return
    if (prefersReducedMotion()) return
    const container = containerRef.current
    if (!container) return

    const gsap = registerGsap()
    const ctx = gsap.context(() => {
      // Máximo ~8% da altura da mídia, conforme o briefing.
      gsap.to('[data-hero-parallax]', {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: container, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, container)

    return () => ctx.revert()
  }, [source.src])

  // Vídeo conduzido pelo scroll.
  useEffect(() => {
    if (source.src === null) return

    // Lido do módulo de flags, não do DOM: o React pode ter acabado de limpar
    // os atributos do <html> ao recuperar de um erro de hidratação.
    const scrub = heroScrubEnabled()

    // Sem scrub não há nada a esconder: se a intro ficou marcada por engano,
    // sai já. É a rede de segurança para o header não ficar invisível.
    if (!scrub || prefersReducedMotion()) {
      endHeroIntro()
      return
    }

    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) {
      endHeroIntro()
      return
    }

    // O `poster` do <video> não aceita `media`: escolhe-se aqui, com a mesma
    // regra das fontes, para nunca aparecer por um frame o enquadramento errado.
    const poster =
      source.posterMobile && window.matchMedia(PORTRAIT).matches ? source.posterMobile : source.poster
    if (poster) video.poster = poster

    // Só agora vale a pena descarregar o ficheiro inteiro: sem ele em buffer o
    // scrub avança aos saltos.
    video.preload = 'auto'
    video.load()

    const gsap = registerGsap()
    let trigger: ScrollTrigger | null = null
    let duration = 0
    /** Instante pedido pelo scroll, em segundos. */
    let target = 0
    /** Progresso da hero (0–1) na última atualização do scroll. */
    let progress = 0
    let pending: number | null = null
    let seeking = false
    let seekStartedAt = 0
    let reach = 0
    let reachGrewAt = performance.now()

    /**
     * Até onde o vídeo já chegou, em contínuo desde o início. O download é
     * sequencial, e é neste trecho que um salto é instantâneo.
     */
    const reachable = () => {
      const ranges = video.buffered
      for (let i = 0; i < ranges.length; i++) {
        if (ranges.start(i) <= 0.1) return ranges.end(i) >= duration - 0.1 ? duration : ranges.end(i)
      }
      return 0
    }

    /**
     * Uma escrita a `currentTime` em voo de cada vez — sem esta guarda o Safari
     * acumula seeks e a imagem estremece. Mas nunca presa: um salto que demore
     * mais de 400 ms deixa de bloquear o seguinte.
     */
    const commit = () => {
      if (pending === null) return
      if (seeking && performance.now() - seekStartedAt < 400) return
      const next = pending
      pending = null
      seeking = true
      seekStartedAt = performance.now()
      video.currentTime = next
    }

    /**
     * O vídeo acompanha o download: nunca salta para um trecho que ainda não
     * chegou. Esse salto ficava à espera da rede e prendia todos os seguintes —
     * era a imagem parada a meio com o scroll a andar. Assim mostra o frame
     * mais avançado disponível e continua a avançar à medida que os dados
     * chegam, até alcançar o scroll.
     *
     * Exceção: se o download não avança (o Safari em iOS pode não descarregar
     * um vídeo parado), deixa de limitar. Um salto além do buffer é então o que
     * obriga o browser a pedir os dados.
     */
    const update = () => {
      if (!duration) return
      const available = reachable()
      if (available > reach) {
        reach = available
        reachGrewAt = performance.now()
      }
      const stalled = available < duration && performance.now() - reachGrewAt > 1500
      pending = stalled ? target : Math.min(target, available)
      commit()
    }

    /** O menu e o texto entram quando o vídeo chegou mesmo ao fim — não antes. */
    const maybeReveal = () => {
      if (progress >= REVEAL_AT && video.currentTime >= duration - 0.1) endHeroIntro()
    }

    const onSeeked = () => {
      seeking = false
      maybeReveal()
      commit()
    }

    const onMeta = () => {
      setReady(true)
      duration = video.duration
      if (!Number.isFinite(duration) || duration === 0) {
        endHeroIntro()
        return
      }

      // Em touch o scrub de vídeo é caro; um `scrub` mais folgado troca
      // precisão por fluidez, que é o que o briefing pede.
      const isCoarse = !hasFinePointer()

      trigger = ScrollTrigger.create({
        trigger: container.parentElement?.parentElement ?? container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: isCoarse ? 0.6 : 0.35,
        onUpdate: (self) => {
          progress = self.progress
          target = Math.min(1, Math.max(0, progress / VIDEO_END)) * duration
          update()
          maybeReveal()
        },
        // Quem passa a hero inteira antes de o vídeo chegar ao fim não pode
        // ficar sem menu no resto da página.
        onLeave: () => endHeroIntro(),
      })
    }

    // Se o vídeo não carregar, a intro não pode ficar a prender o site.
    const onError = () => endHeroIntro()

    // Escape para quem navega por teclado: o header tem de estar alcançável
    // sem depender de scroll.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') endHeroIntro()
    }

    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('seeked', onSeeked)
    // Chegaram dados: o vídeo avança até onde o scroll já está.
    video.addEventListener('progress', update)
    video.addEventListener('error', onError)
    window.addEventListener('keydown', onKeyDown)
    if (video.readyState >= 1) onMeta()

    return () => {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('progress', update)
      video.removeEventListener('error', onError)
      window.removeEventListener('keydown', onKeyDown)
      trigger?.kill()
      gsap.killTweensOf(video)
    }
  }, [source.src, source.poster, source.posterMobile])

  if (source.src === null) {
    return (
      <div ref={containerRef} className="absolute inset-0">
        <div data-hero-parallax className="absolute inset-0 h-[110%]">
          <MediaSlot
            media={media.heroPoster}
            priority
            fillParent
            sizes="100vw"
            className="h-full w-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* `preload="none"`: sem intro a hero é estática e o vídeo nunca chega a
          ser pedido. Com intro, o efeito passa-o a `auto` e carrega-o. */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        className="h-full w-full object-cover"
        style={{ objectPosition: media.heroPoster.position }}
      >
        {/* O browser fica com a primeira fonte cujo `media` bate: em retrato o
            recorte vertical nativo, no resto o 4K inteiro. Só uma é
            descarregada. */}
        {source.srcMobile ? (
          <source media={PORTRAIT} src={source.srcMobile} type="video/mp4" />
        ) : null}
        <source src={source.src} type="video/mp4" />
      </video>

      {/* Posters visíveis até o vídeo ter metadata, com a mesma escolha de
          enquadramento das fontes. São dois e o CSS mostra um: o primeiro frame
          quando a intro vai correr (é daí que o vídeo parte), o último quando
          não corre — visitas seguintes e reduced motion —, para a hero assentar
          sempre na imagem final. O último é lazy: numa primeira visita está
          escondido e nem chega a ser pedido.
          <img> cru de propósito: o next/image aqui só acrescentaria um
          pipeline de otimização a uma imagem que desaparece em segundos. */}
      {!ready && source.poster ? (
        <picture data-hero-poster="first">
          {source.posterMobile ? <source media={PORTRAIT} srcSet={source.posterMobile} /> : null}
          <img
            src={source.poster}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : null}
      {!ready && source.posterFinal ? (
        <picture data-hero-poster="final">
          {source.posterFinalMobile ? (
            <source media={PORTRAIT} srcSet={source.posterFinalMobile} />
          ) : null}
          <img
            src={source.posterFinal}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : null}
    </div>
  )
}
