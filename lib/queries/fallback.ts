import type { Project, ProjectMedia, ProjectSummary } from '@/lib/types'
import oLuziaConteudo from '@/content/oluzia-galeria.json'

/**
 * Conjunto local de projetos.
 *
 * Serve de duas maneiras: é o que o site mostra quando não há Supabase
 * configurado, e é o conteúdo inicial do armazenamento local do painel
 * (`lib/store/dev-store.ts`).
 *
 * Nome e estado vêm do PDF aprovado; as fotografias, do cliente. As descrições
 * são PROVISÓRIAS — texto de exemplo pedido para a aprovação, escrito só a
 * partir do que se sabe (número de casas, estado, o que as imagens mostram) e a
 * substituir pelo cliente no painel. Ano e área ficam vazios e o site
 * omite-os.
 * O mesmo conteúdo está em `supabase/seed.sql`.
 */
const base = {
  excerpt: null,
  location: null,
  year: null,
  area: null,
  typology: null,
  coverUrl: null,
  coverAlt: null,
  coverFocalPoint: '50% 50%',
  heroVideoUrl: null,
  blocks: [],
  published: true,
  archived: false,
  seoTitle: null,
  seoDescription: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  media: [],
} satisfies Omit<
  Project,
  'id' | 'slug' | 'title' | 'category' | 'status' | 'featured' | 'displayOrder'
>

/**
 * Galeria do O'LUZIA.
 *
 * Os dados estão em `content/oluzia-galeria.json` e não aqui: é o mesmo
 * ficheiro que o `npm run sincronizar` escreve na base de dados. Uma fonte só,
 * para o que o site mostra sem Supabase e o que está no Supabase não poderem
 * divergir.
 *
 * A ordem conta o empreendimento casa a casa — dentro de cada moradia abrem os
 * exteriores e só depois os interiores. A legenda aparece na primeira
 * fotografia de cada uma e marca onde começa o bloco.
 *
 * As dimensões reservam o espaço na página. O `focal` é a exceção: a galeria
 * mostra tudo em 16:9 e quase todas já o são, mas as que não são cortam, e aí
 * interessa dizer por onde.
 */
type GalleryItem = {
  url: string
  alt: string
  caption?: string
  focal?: string
  width: number
  height: number
}

const oLuziaGallery = oLuziaConteudo.media as GalleryItem[]

function oLuziaMedia(projectId: string): ProjectMedia[] {
  return oLuziaGallery.map((item, index) => ({
    id: `seed-o-luzia-${index + 1}`,
    projectId,
    url: item.url,
    alt: item.alt,
    caption: item.caption ?? null,
    position: index,
    focalPoint: item.focal ?? '50% 50%',
    width: item.width,
    height: item.height,
  }))
}

export const fallbackProjects: Project[] = [
  {
    ...base,
    id: 'seed-o-luzia',
    slug: 'o-luzia',
    title: "O'LUZIA",
    category: 'desenvolvimento',
    status: 'em-execucao',
    featured: true,
    displayOrder: 1,
    excerpt:
      'Conjunto de cinco moradias contemporâneas desenvolvido pela Luxury Objective, atualmente em execução. Linhas depuradas, espaços exteriores generosos e acabamentos de elevado padrão.',
    location: 'Vila do Conde',
    typology: 'Moradias unifamiliares',
    blocks: [
      {
        type: 'paragraph',
        text: 'O empreendimento reúne cinco moradias independentes, pensadas para quem procura conforto, privacidade e qualidade de construção. Cada casa combina áreas sociais amplas e luminosas com zonas privadas bem resolvidas, sempre em relação com o exterior.',
      },
      {
        type: 'paragraph',
        text: 'A Luxury Objective acompanha o empreendimento de forma integrada — da estruturação à execução em obra — com controlo de prazos, custos e qualidade em cada fase.',
      },
      {
        type: 'heading',
        text: 'Destaques',
      },
      {
        type: 'list',
        items: [
          'Cinco moradias independentes',
          'Arquitetura contemporânea, com grandes vãos envidraçados',
          'Piscinas e zonas exteriores de estar',
          'Interiores amplos, com luz natural e pé-direito generoso',
          'Acompanhamento integrado, da estruturação à execução',
        ],
      },
    ],
    // A fachada da moradia 1, que abre a galeria. Horizontal e de alta
    // resolução: a capa anterior era vertical e ficava mal na lista 3:1.
    coverUrl: oLuziaConteudo.cover.url,
    coverAlt: oLuziaConteudo.cover.alt,
    // A lista da página Projetos recorta a capa a 3:1 — vê-se pouco mais de
    // metade da altura. Subir o ponto focal põe a casa inteira nessa faixa,
    // do beirado ao terraço; a meio mostrava parede e relva.
    coverFocalPoint: oLuziaConteudo.cover.focal,
    media: oLuziaMedia('seed-o-luzia'),
  },
  {
    ...base,
    id: 'seed-macieira-da-maia',
    slug: 'macieira-da-maia',
    title: 'MACIEIRA DA MAIA',
    category: 'desenvolvimento',
    status: 'em-desenvolvimento',
    featured: true,
    displayOrder: 2,
    excerpt:
      'Projeto de desenvolvimento imobiliário em Macieira da Maia, atualmente em fase de desenvolvimento. Mais detalhes serão divulgados em breve.',
    location: 'Macieira da Maia',
    typology: null,
    blocks: [
      {
        type: 'paragraph',
        text: 'Em fase de estudo e estruturação, o projeto segue a abordagem integrada que orienta toda a atividade da Luxury Objective — da análise da oportunidade à execução e comercialização.',
      },
    ],
  },
]

export function fallbackSummaries(): ProjectSummary[] {
  return fallbackProjects.map(toSummary)
}

export function toSummary(project: Project): ProjectSummary {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    category: project.category,
    status: project.status,
    excerpt: project.excerpt,
    location: project.location,
    coverUrl: project.coverUrl,
    coverAlt: project.coverAlt,
    coverFocalPoint: project.coverFocalPoint,
    featured: project.featured,
    displayOrder: project.displayOrder,
    published: project.published,
    updatedAt: project.updatedAt,
    preview: project.media.map(({ url, alt, width, height, focalPoint }) => ({
      url,
      alt,
      width,
      height,
      focalPoint,
    })),
  }
}
