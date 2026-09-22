import type { ProjectPreviewMedia, ProjectSummary } from '@/lib/types'

/**
 * Ordem das fotografias no carrossel de um projeto.
 *
 * Vive fora do componente de propósito: o carrossel é um componente de cliente,
 * e a lista da página Projetos é renderizada no servidor — uma função exportada
 * de um módulo de cliente não pode ser chamada do servidor.
 */

export type CarouselSlide = ProjectPreviewMedia & {
  /** A capa é enquadrada à mão (ponto focal): preenche sempre a moldura. */
  cover?: boolean
}

export const isLandscape = (slide: CarouselSlide) =>
  slide.width && slide.height ? slide.width / slide.height >= 1.2 : false

/**
 * Capa seguida da galeria, sem repetir a capa se ela também estiver na galeria.
 *
 * `leadLandscape`: em molduras muito largas (a lista da página Projetos chega a
 * 3:1) abre com a primeira fotografia horizontal da galeria em vez da capa. Uma
 * capa vertical nessa moldura ficava reduzida a uma faixa, ou ampliada e
 * esbatida. A capa segue logo a seguir.
 */
export function projectSlides(project: ProjectSummary, leadLandscape = false): CarouselSlide[] {
  const cover: CarouselSlide[] = project.coverUrl
    ? [
        {
          url: project.coverUrl,
          alt: project.coverAlt ?? project.title,
          width: null,
          height: null,
          focalPoint: project.coverFocalPoint,
          cover: true,
        },
      ]
    : []
  const gallery: CarouselSlide[] = project.preview.filter((item) => item.url !== project.coverUrl)

  if (!leadLandscape) return [...cover, ...gallery]

  const first = gallery.findIndex(isLandscape)
  if (first < 0) return [...cover, ...gallery]
  const [lead] = gallery.splice(first, 1)
  return lead ? [lead, ...cover, ...gallery] : [...cover, ...gallery]
}
