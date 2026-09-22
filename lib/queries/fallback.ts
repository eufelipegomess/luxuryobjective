import type { Project, ProjectMedia, ProjectSummary } from '@/lib/types'

const IK = 'https://ik.imagekit.io/53ddmm7un'

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
 * Galeria do O'LUZIA: exteriores primeiro, depois interiores, depois vivência.
 *
 * As dimensões reais vão com cada imagem para a galeria desenhar a moldura
 * pela fotografia (ver ProjectGallery). A ordem fecha as linhas: verticais aos
 * pares. A IMG-1453 e a IMG-1454 saíram: não são do O'LUZIA.
 */
const oLuziaGallery: { file: string; alt: string; width: number; height: number }[] = [
  {
    file: 'fachada%20luxo%20%C3%A1%20noite.jpg',
    alt: 'Moradia do O’LUZIA com piscina, ao anoitecer',
    width: 3280,
    height: 1845,
  },
  { file: '1a.jpg', alt: 'Fachada de uma moradia do O’LUZIA', width: 2400, height: 3000 },
  {
    file: 'fachada_oluzia_rua_final_ultra%20(1)%20(1).png',
    alt: 'Arruamento e fachadas das moradias do O’LUZIA',
    width: 1632,
    height: 2176,
  },
  {
    file: '2_PP.jpg',
    alt: 'Moradia do O’LUZIA com zona de estar exterior',
    width: 2560,
    height: 1440,
  },
  {
    file: 'projeto_fotorrealista%20(1).png',
    alt: 'Fachada e arruamento do O’LUZIA',
    width: 1632,
    height: 2176,
  },
  { file: '4a.jpg', alt: 'Piscina e zona de estar exterior', width: 2400, height: 3000 },
  { file: '2_PP_1%20(1).jpg', alt: 'Moradia do O’LUZIA com piscina', width: 2560, height: 1440 },
  {
    file: 'WhatsApp%20Image%202026-07-16%20at%2011.58.42%20(3).jpeg',
    alt: 'Piscina interior coberta',
    width: 2048,
    height: 1152,
  },
  {
    file: 'image%20(10).png',
    alt: 'Sala de estar com escada e pátio interior',
    width: 1632,
    height: 2176,
  },
  {
    file: 'K8yTrLMlfu1CnArAXfTu9X-img-3_1784210120000_na1fn_aW50ZXJpb3JfbGlmZXN0eWxlXzM.webp',
    alt: 'Sala de estar vista do piso superior',
    width: 1632,
    height: 2176,
  },
  {
    file: '3%20(2)%20(1).jpg',
    alt: 'Sala de estar e zona de refeições',
    width: 3000,
    height: 1688,
  },
  {
    file: 'IMG_4860.webp',
    alt: 'Escada interior em madeira com iluminação embutida',
    width: 1664,
    height: 2080,
  },
  {
    file: 'WhatsApp%20Image%202026-07-16%20at%2011.58.42%20(1).jpeg',
    alt: 'Quarto ao nascer do sol',
    width: 1638,
    height: 2048,
  },
  {
    file: 'quarto_lifestyle_cha_corrigido%20(1).png',
    alt: 'Quarto ao fim da tarde',
    width: 1440,
    height: 2560,
  },
  { file: 'bathroom_sink_vanity.png', alt: 'Casa de banho em mármore', width: 1664, height: 2080 },
  {
    file: 'bathroom_story_3%20(1).png',
    alt: 'Casa de banho com duche e bancada dupla',
    width: 1440,
    height: 2560,
  },
  {
    file: '532489808_18045216527643996_5965576437815426897_n%20(2).jpg',
    alt: 'Sala de estar com vista para o jardim',
    width: 1170,
    height: 1170,
  },
  {
    file: 'ChatGPT%20Image%2016_07_2026,%2015_19_52.png',
    alt: 'Zona de leitura junto ao pátio interior',
    width: 1254,
    height: 1254,
  },
  { file: 'instagram_table_setting_1.png', alt: 'Mesa de jantar posta', width: 1920, height: 1920 },
  {
    file: 'family_interaction_dining.png',
    alt: 'Refeição em família na sala de jantar',
    width: 1920,
    height: 1920,
  },
  {
    file: 'breakfast_closeup_lifestyle.png',
    alt: 'Pequeno-almoço na cozinha',
    width: 1920,
    height: 1920,
  },
]

function oLuziaMedia(projectId: string): ProjectMedia[] {
  return oLuziaGallery.map((item, index) => ({
    id: `seed-o-luzia-${index + 1}`,
    projectId,
    url: `${IK}/OLUZIA/${item.file}`,
    alt: item.alt,
    caption: null,
    position: index,
    focalPoint: '50% 50%',
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
    // Capa escolhida pelo cliente. É vertical: na lista da página Projetos
    // (3:1) o carrossel abre com a primeira horizontal da galeria.
    coverUrl: 'https://ik.imagekit.io/53ddmm7un/img%20capa%20Oluzia.jpeg',
    coverAlt: 'Arruamento e fachadas das moradias do O’LUZIA',
    coverFocalPoint: '50% 62%',
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
