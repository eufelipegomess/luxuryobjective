import type { Project, ProjectMedia, ProjectSummary } from '@/lib/types'

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
 * Galeria do O'LUZIA: as cinco moradias, uma de cada vez.
 *
 * A ordem é a do cliente e conta o empreendimento casa a casa — dentro de cada
 * moradia abrem os exteriores e só depois entram os interiores. A legenda
 * aparece apenas na primeira fotografia de cada uma: marca onde começa o bloco
 * sem repetir texto debaixo de todas.
 *
 * As dimensões reais vão com cada imagem para reservar o espaço na página. O
 * `focal` é a exceção: a galeria mostra tudo em 16:9 e quase todas estas são
 * 16:9, mas as que não são cortam, e aí interessa dizer por onde.
 *
 * O URL vai inteiro, e não montado a partir de um nome de ficheiro: estas
 * vivem em pastas por lote e trazem o `updatedAt` do ImageKit.
 */
const oLuziaGallery: {
  url: string
  alt: string
  caption?: string
  focal?: string
  width: number
  height: number
}[] = [
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Fachada%20(frente).jpg?updatedAt=1790251417599',
    alt: 'Moradia 1 do O’LUZIA vista da frente',
    caption: 'Moradia 1',
    width: 2560,
    height: 1440,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Piscina.jpg?updatedAt=1790251418398',
    alt: 'Piscina e zona exterior de estar da moradia 1',
    width: 2560,
    height: 1440,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Sala.jpg?updatedAt=1790251417361',
    alt: 'Sala de estar da moradia 1',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Sala%20.jpg?updatedAt=1790251418050',
    alt: 'Sala de estar da moradia 1, de outro ângulo',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Quarto%20.jpg?updatedAt=1790251417482',
    alt: 'Quarto principal da moradia 1',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Penteadeira.jpg?updatedAt=1790251418089',
    alt: 'Zona de penteadeira no quarto da moradia 1',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Corredor.jpg?updatedAt=1790251417322',
    alt: 'Corredor de acesso aos quartos da moradia 1',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Casa%20de%20banho.jpg?updatedAt=1790251417347',
    alt: 'Casa de banho da moradia 1',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Escada.jpg?updatedAt=1790251416792',
    alt: 'Escada interior da moradia 1',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Tv.jpg?updatedAt=1790251416580',
    alt: 'Zona de televisão da moradia 1',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Cozinha.jpg?updatedAt=1790251416322',
    alt: 'Cozinha da moradia 1',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Fachada%20(Frente).jpg?updatedAt=1790251498495',
    alt: 'Moradia 2 do O’LUZIA vista da frente',
    caption: 'Moradia 2',
    width: 2560,
    height: 1440,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Piscina%20(exterior).jpg?updatedAt=1790251497121',
    alt: 'Piscina exterior da moradia 2',
    width: 2560,
    height: 1440,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/sala%20lote%2002.jpeg',
    alt: 'Sala de estar da moradia 2',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-%20Casa%20de%20banho%20(casal).jpg?updatedAt=1790251503395',
    alt: 'Casa de banho da suíte da moradia 2',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal-%20Casa%20de%20banho.jpg?updatedAt=1790251504567',
    alt: 'Casa de banho da moradia 2',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Cozinha.jpg?updatedAt=1790251505361',
    alt: 'Cozinha da moradia 2',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Quarto.jpg?updatedAt=1790251506039',
    alt: 'Quarto da moradia 2',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Quarto%20(lateral).jpg?updatedAt=1790251505782',
    alt: 'Quarto da moradia 2, vista lateral',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-%20closet%20.png?updatedAt=1790251507130',
    alt: 'Closet da moradia 2',
    width: 2560,
    height: 1440,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Escada.jpg?updatedAt=1790251506198',
    alt: 'Escada interior da moradia 2',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Fachada%20(frente).png?updatedAt=1790251548988',
    alt: 'Moradia 3 do O’LUZIA vista da frente',
    caption: 'Moradia 3',
    width: 1672,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/piscina%20lote%2003.png',
    alt: 'Piscina exterior da moradia 3',
    width: 1672,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-Sala.jpg?updatedAt=1790251549205',
    alt: 'Sala de estar da moradia 3',
    width: 3280,
    height: 1845,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Quarto.png?updatedAt=1790251548884',
    alt: 'Quarto da moradia 3',
    width: 1672,
    height: 940,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Cozinha_.png?updatedAt=1790251546940',
    alt: 'Cozinha da moradia 3',
    width: 1672,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Sala%20de%20jantar.jpg?updatedAt=1790251538228',
    alt: 'Sala de jantar da moradia 3',
    width: 1408,
    height: 1056,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20corredor%20(oficial).png?updatedAt=1790251548547',
    alt: 'Corredor da moradia 3',
    width: 1672,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Escrit%C3%B3rio%20golden%20Hour.jpg?updatedAt=1790251538240',
    alt: 'Escritório da moradia 3 ao fim da tarde',
    width: 1672,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-Casa%20de%20banho.jpg?updatedAt=1790251544623',
    alt: 'Casa de banho da moradia 3',
    width: 3280,
    height: 1845,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/img%20casa%20lote%2004%201.PNG',
    alt: 'Moradia 4 do O’LUZIA vista da frente',
    caption: 'Moradia 4',
    width: 1672,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/img%20casa%20lote%2004%202.PNG',
    alt: 'Moradia 4 do O’LUZIA vista de trás',
    focal: '50% 40%',
    width: 1115,
    height: 939,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal%20-%20Sala.png?updatedAt=1790251604909',
    alt: 'Sala de estar da moradia 4',
    width: 1672,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal%20-%20Sala%20de%20Jantar.png?updatedAt=1790251603927',
    alt: 'Sala de jantar da moradia 4',
    width: 1671,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal-%20Quarto%20amadeirado%20frontal.png?updatedAt=1790251603714',
    alt: 'Quarto em madeira da moradia 4, vista frontal',
    width: 1520,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2004/horizontal%20-%20quarto%20ros%C3%A9.png?updatedAt=1790251613161',
    alt: 'Quarto em tons rosé da moradia 4',
    width: 1370,
    height: 939,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal%20-%20Quarto%20amadeirado.png?updatedAt=1790251602067',
    alt: 'Quarto em madeira da moradia 4',
    width: 1672,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal%20-%20cozinha.png?updatedAt=1790251601920',
    alt: 'Cozinha da moradia 4',
    width: 1672,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2004/horizontal%20-%20hall%20.png?updatedAt=1790251600480',
    alt: 'Hall de entrada da moradia 4',
    width: 1396,
    height: 941,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/img%20casa%20lote%2005%20frente.jpeg',
    alt: 'Moradia 5 do O’LUZIA vista da frente',
    caption: 'Moradia 5',
    width: 2560,
    height: 1440,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/img%20casa%20lote%2005%20tr%C3%A1s.jpeg',
    alt: 'Moradia 5 do O’LUZIA vista de trás, com piscina',
    width: 2560,
    height: 1440,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2005/Piscina%20interior%20(of.).jpg?updatedAt=1790251667328',
    alt: 'Piscina interior da moradia 5',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2005/Sinuca%20-%20Sala%20(vers%C3%A3o%20of.).jpg?updatedAt=1790251669512',
    alt: 'Sala com mesa de bilhar da moradia 5',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2005/Cozinha%20(of.).jpg?updatedAt=1790251667687',
    alt: 'Cozinha da moradia 5',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2005/Quarto%20(of.).jpg?updatedAt=1790251667691',
    alt: 'Quarto da moradia 5',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2005/Sala%20de%20Jantar%20(of.).jpg?updatedAt=1790251668753',
    alt: 'Sala de jantar da moradia 5',
    width: 3000,
    height: 1688,
  },
  {
    url: 'https://ik.imagekit.io/53ddmm7un/LOTE%2005/Sala%20(vers%C3%A3o%20of.).jpg?updatedAt=1790251669477',
    alt: 'Sala de estar da moradia 5',
    width: 3000,
    height: 1688,
  },
]

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
    coverUrl: oLuziaGallery[0]!.url,
    coverAlt: 'Fachada de uma das moradias do O’LUZIA',
    // A lista da página Projetos recorta a capa a 3:1 — vê-se pouco mais de
    // metade da altura. Subir o ponto focal põe a casa inteira nessa faixa,
    // do beirado ao terraço; a meio mostrava parede e relva.
    coverFocalPoint: '50% 43%',
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
