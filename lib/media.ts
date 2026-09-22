/**
 * Mapa único de mídia do site.
 *
 * As imagens vivem no ImageKit (`ik.imagekit.io/53ddmm7un`). O host está
 * declarado em `next.config.ts` — sem isso o `next/image` recusa-se a servi-las.
 *
 * Um slot com `src: null` continua a desenhar um placeholder editorial neutro
 * com o aspect ratio final. Nunca uma imagem de stock aleatória, e nunca um
 * substituto que finja ser o que ainda falta.
 *
 * PARA SUBSTITUIR: troca o `src` pelo novo URL. Nenhum outro ficheiro muda.
 */

const IK = 'https://ik.imagekit.io/53ddmm7un'

export type MediaRef = {
  /** URL da imagem. `null` = ainda por fornecer pelo cliente. */
  src: string | null
  /** Alt descritivo. Vazio ("") marca a imagem como decorativa. */
  alt: string
  /** Proporção reservada, para evitar CLS mesmo com placeholder. */
  ratio: number
  /** Focal point em `object-position`. */
  position?: string
  /** Etiqueta do slot, visível apenas no placeholder. */
  slot: string
  /**
   * Serve o ficheiro original, sem passar pelo otimizador. Só para imagens que
   * já chegam pequenas e que qualquer recompressão estragava (os retratos).
   */
  original?: boolean
  /**
   * Zoom interno (ex.: 1.04) para imagens com um defeito na borda. A moldura
   * não muda; a imagem cresce dentro dela e a borda fica de fora.
   */
  zoom?: number
}

export type VideoRef = {
  src: string | null
  /** Versão para ecrãs em retrato. `null` = usa `src` em todo o lado. */
  srcMobile: string | null
  poster: string | null
  posterMobile: string | null
  /** Último frame: a hero estática, quando a intro não corre. */
  posterFinal: string | null
  posterFinalMobile: string | null
  slot: string
}

export const brand = {
  logoDark: '/brand/logo-dark.svg',
  logoLight: '/brand/logo-light.svg',
  iconPrimary: '/brand/icon-primary.svg',
  iconSecondary: '/brand/icon-secondary.svg',
  grafismo: '/brand/grafismo.svg',
  favicon: '/favicon.svg',
} as const

export const media = {
  /**
   * Hero da Home. O vídeo final é fornecido depois; o componente recebe-o por
   * configuração e nunca por nome de ficheiro fixo. Enquanto `heroVideo.src`
   * for null, a hero usa este poster com parallax leve.
   */
  heroPoster: {
    // Primeiro frame do vídeo: é o que se vê antes de ele carregar e em
    // `prefers-reduced-motion`, por isso tem de ser a mesma imagem.
    src: '/media/hero-4k-poster.jpg',
    alt: '',
    ratio: 16 / 9,
    position: '50% 50%',
    slot: 'Hero — render arquitetónico',
  } satisfies MediaRef,

  /**
   * Vídeo da hero, percorrido pelo scroll. Original do cliente em 4K
   * (ImageKit, `Video hero/hero nova 4k.mp4`, pedido com `tr=orig-true` — sem
   * isso o ImageKit entrega uma versão já recomprimida).
   *
   * No scrub cada movimento do scroll é um salto no vídeo, e cada salto obriga
   * a descodificar desde o keyframe anterior. O original tem só dois keyframes
   * em 8 s. As versões abaixo têm um keyframe em cada frame: cada salto é um
   * único frame. Geradas por `scripts/prepare-hero-video.mjs`.
   *
   * - `src`: 2560×1440. Começou em 4K, mas o 4K é que travava: medido num scroll
   *   contínuo, o 4K não passava de ~10 frames por segundo nem com keyframes
   *   densos; a 2560 passa para o dobro, com um ficheiro mais leve. Num ecrã
   *   comum (1440–1920 px) não se distingue do 4K.
   * - `srcMobile`: 1216×2160, recorte 9:16 tirado dos próprios pixels do 4K,
   *   sem redimensionar. Num ecrã vertical o 16:9 mostrava um terço da imagem
   *   ampliado; assim cada pixel do ecrã tem um pixel real por trás.
   *
   * Nomes novos de propósito: `/media/*` está em cache imutável durante um ano
   * (netlify.toml), e com o nome antigo quem já visitou o site continuava a ver
   * o vídeo anterior.
   */
  heroVideo: {
    src: '/media/hero-1440p.mp4',
    srcMobile: '/media/hero-vertical.mp4',
    poster: '/media/hero-4k-poster.jpg',
    posterMobile: '/media/hero-4k-poster-mobile.jpg',
    posterFinal: '/media/hero-4k-final.jpg',
    posterFinalMobile: '/media/hero-4k-final-mobile.jpg',
    slot: 'Hero — vídeo controlado pelo scroll',
  } satisfies VideoRef,

  /**
   * Recorte da apresentação da empresa; abre para a esquerda ao scrollar.
   *
   * Tem de aguentar os dois estados: recortada numa janela estreita e depois a
   * ocupar o ecrã todo. Por isso é larga e de alta resolução — uma imagem
   * vertical de 1080px ficava esticada a 1440 e perdia nitidez.
   *
   * Exterior e não interior: numa promotora a casa apresenta-se pela fachada.
   * A janela inicial fica do lado direito do ecrã, onde esta fotografia tem uma
   * parede branca lisa; ancorada a 0% na horizontal, o que lá aparece é a casa.
   */
  apresentacao: {
    src: `${IK}/OLUZIA/2_PP_1%20(1).jpg`,
    alt: 'Moradia com piscina do empreendimento O’LUZIA',
    ratio: 3 / 4,
    position: '0% 50%',
    slot: 'Apresentação da empresa',
  } satisfies MediaRef,

  /** As duas áreas de atuação — os dois únicos painéis com mídia forte. */
  areaDesenvolvimento: {
    // Fachada 16:9 em luz de dia. Tem de ser diurna: no painel a imagem fica
    // debaixo de um véu escuro a 72%, e uma fotografia noturna desaparecia.
    src: `${IK}/IMAGENS%20SITE/1_PP_2.jpg`,
    alt: 'Fachada de uma moradia contemporânea',
    ratio: 4 / 3,
    position: '50% 50%',
    slot: 'Área — Desenvolvimento Imobiliário',
  } satisfies MediaRef,

  /** Serviços — Construção. Moradia do O'LUZIA, construção de raiz, em 16:9. */
  areaConstrucao: {
    src: `${IK}/OLUZIA/2_PP.jpg`,
    alt: 'Moradia do empreendimento O’LUZIA',
    ratio: 4 / 3,
    position: '50% 50%',
    slot: 'Serviços — Construção',
  } satisfies MediaRef,

  areaRemodelacao: {
    // Da remodelação da casa de Arcos. Não do O'LUZIA: é construção nova e não
    // ilustra reabilitação.
    src: `${IK}/FOTOS%20REMODELA%C3%87%C3%83O_/3D%20(SALA)%20-%20para%20casa%20de%20ARCOS%20%20(1).jpg`,
    alt: 'Projeto 3D da sala de uma remodelação da Luxury Objective',
    // O render traz uma faixa clara de ~14 px na borda esquerda.
    zoom: 1.04,
    ratio: 4 / 3,
    position: '50% 50%',
    slot: 'Área — Remodelação & Reabilitação',
  } satisfies MediaRef,

  /** Transição narrativa para a secção de futuros projetos. */
  futuros: {
    // Arruamento e fachadas em vez de um interior: a secção fala de terrenos e
    // oportunidades. A fotografia é vertical e a faixa 21:9 mostra só um terço
    // da altura, por isso o foco desce até à banda das casas.
    src: `${IK}/OLUZIA/fachada_oluzia_rua_final_ultra%20(1)%20(1).png`,
    alt: '',
    ratio: 21 / 9,
    position: '50% 58%',
    slot: 'Futuros projetos — textura arquitetónica',
  } satisfies MediaRef,

  /** Abertura da página Empresa; abre pelos lados ao scrollar. */
  empresaHero: {
    // Fotografia escolhida pelo cliente para "Quem somos". 16:9 a 2560 px:
    // abre até ao ecrã inteiro sem ampliar.
    src: `${IK}/IMAGENS%20SITE/foto%20quem%20somos.jpeg`,
    alt: 'Fachada de uma moradia contemporânea',
    ratio: 21 / 9,
    position: '50% 50%',
    slot: 'Empresa — abertura',
  } satisfies MediaRef,

  /**
   * Retratos da liderança, fornecidos pelo cliente.
   *
   * O enquadramento sobe para a cara: a moldura é quase quadrada em desktop e
   * mais larga do que alta em mobile, e a meio da fotografia ficava o peito.
   */
  retratoNathalie: {
    src: `${IK}/IMG_6945.JPG.jpeg`,
    alt: 'Nathalie Ramos Ferreira, Co-CEO & Fundadora',
    ratio: 3 / 4,
    position: '50% 22%',
    // Retrato de ~150 KB: vai o ficheiro original, sem recompressão.
    original: true,
    slot: 'Retrato — Nathalie Ramos Ferreira',
  } satisfies MediaRef,

  retratoBruno: {
    src: `${IK}/IMG_6946.JPG.jpeg`,
    alt: 'Bruno Carvalho, Co-CEO & Diretor de Operações e Execução',
    ratio: 3 / 4,
    position: '50% 20%',
    original: true,
    slot: 'Retrato — Bruno Carvalho',
  } satisfies MediaRef,

  /**
   * Fallback de capa para projetos sem imagem no painel.
   *
   * Fica em placeholder de propósito: uma fotografia genérica aqui faria um
   * projeto sem capa parecer que tem uma.
   */
  projetoFallback: {
    src: null,
    alt: '',
    ratio: 16 / 10,
    position: '50% 50%',
    slot: 'Projeto — imagem de capa',
  } satisfies MediaRef,
} as const

export type MediaKey = keyof typeof media

/** `true` quando já existe mídia real na hero. */
export const hasRealHeroMedia = media.heroPoster.src !== null || media.heroVideo.src !== null
