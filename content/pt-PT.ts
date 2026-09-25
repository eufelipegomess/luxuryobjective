/**
 * Copy institucional aprovada — Luxury Objective.
 * Fonte da verdade: "Luxury Objective-Copy Institucional v5.pdf".
 *
 * REGRA ABSOLUTA: nenhuma palavra desta copy pode ser alterada, resumida,
 * traduzida ou reescrita. Rótulos técnicos de interface (Menu, Fechar,
 * Anterior, Seguinte...) vivem em `ui` e são os únicos textos criados aqui.
 *
 * Só `pt-PT` está ativo. A forma deste objeto serve de contrato para futuras
 * traduções (en, es) quando forem aprovadas.
 */

export const locale = 'pt-PT' as const

export const site = {
  name: 'Luxury Objective',
  tagline: 'Promotora Imobiliária Integrada',
} as const

export const nav = {
  home: 'Home',
  empresa: 'Empresa',
  servicos: 'Serviços',
  projetos: 'Projetos',
  contacto: 'Contacto',
  cta: 'Saiba mais',
} as const

export const home = {
  hero: {
    title: 'Criamos, transformamos e desenvolvemos espaços com visão.',
    subtitle:
      'Da transformação de imóveis ao desenvolvimento de oportunidades imobiliárias, a Luxury Objective combina visão estratégica, rigor técnico e capacidade de execução para criar projetos com valor e identidade.',
    primaryCta: 'Conheça os nossos projetos',
    secondaryCta: 'Fale connosco',
  },
  apresentacao: {
    title: 'Apresentação da empresa',
    body: 'A Luxury Objective desenvolve projetos e oportunidades imobiliárias, combinando visão estratégica, capacidade de execução e acompanhamento próximo em cada etapa. A empresa atua na transformação e valorização de imóveis e encontra-se num processo de crescimento e consolidação da sua atividade de desenvolvimento e promoção imobiliária. A experiência adquirida na execução de obras permite à Luxury Objective compreender e acompanhar o projeto de forma integrada, desde a sua estruturação até à concretização.',
    cta: 'Conheça a nossa empresa',
  },
  areas: {
    title: 'As nossas áreas de atuação',
    blocks: [
      {
        id: 'desenvolvimento',
        title: 'Desenvolvimento Imobiliário',
        body: 'Identificamos oportunidades, estruturamos projetos imobiliários e acompanhamos o seu desenvolvimento, desde a análise inicial até à execução e comercialização.',
        cta: 'Conheça os nossos projetos',
      },
      {
        id: 'remodelacao',
        title: 'Remodelação & Reabilitação',
        body: 'Transformamos e requalificamos os imóveis através de projetos de remodelação e reabilitação acompanhados com rigor técnico, controlo e atenção ao detalhe.',
        cta: 'Conheça os nossos projetos',
      },
    ],
  },
  destaque: {
    title: 'Projetos em destaque',
    stats: [
      { value: '6', numeric: 6, prefix: '', label: 'Anos de atividade' },
      { value: '+16', numeric: 16, prefix: '+', label: 'Anos de experiência da liderança' },
      { value: '1', numeric: 1, prefix: '', label: 'Projeto imobiliário em execução' },
      { value: '1', numeric: 1, prefix: '', label: 'Projeto em desenvolvimento' },
    ],
    cta: 'Ver projetos em andamento',
  },
  futuros: {
    title: 'Tem um terreno, uma oportunidade ou um projeto em mente?',
    body: 'A Luxury Objective está continuamente a analisar novas oportunidades de desenvolvimento imobiliário e parcerias estratégicas.',
    cta: 'Apresentar uma oportunidade',
  },
  chamadaFinal: {
    body: 'Tem um terreno, um projeto ou uma oportunidade de investimento? Fale connosco.',
    cta: 'Fale connosco',
  },
} as const

export const empresa = {
  quemSomos: {
    title: 'Quem somos',
    body: 'A Luxury Objective nasceu da experiência adquirida na área da construção, remodelação e reabilitação e encontra-se hoje num processo de evolução e crescimento, reforçando progressivamente a sua atuação no desenvolvimento e promoção imobiliária. A empresa combina experiência de execução, visão estratégica e capacidade de desenvolvimento para criar, transformar e valorizar projetos imobiliários.',
  },
  mvv: {
    title: 'Missão, visão e valores',
    missaoLabel: 'Missão',
    missao:
      'Criar, transformar e desenvolver projetos com visão, rigor e compromisso, gerando valor real em cada etapa do processo.',
    visaoLabel: 'Visão',
    visao:
      'Consolidar a Luxury Objective como uma empresa de referência no desenvolvimento imobiliário, reconhecida pela capacidade de identificar oportunidades, estruturar projetos e assegurar a sua concretização com rigor, qualidade e visão de longo prazo.',
    valoresLabel: 'Valores',
    valores: [
      'Excelência',
      'Rigor',
      'Profissionalismo',
      'Transparência',
      'Compromisso',
      'Inovação',
      'Visão de longo prazo',
      'Criação de valor',
    ],
  },
  lideranca: {
    title: 'A nossa liderança',
    people: [
      {
        id: 'nathalie',
        name: 'Nathalie Ramos Ferreira',
        role: 'Co-CEO & Fundadora',
        body: 'Responsável pela estratégia, gestão e crescimento da Luxury Objective, acompanha a estruturação empresarial e financeira, o desenvolvimento dos projetos e a evolução da marca. Define a visão e as prioridades de crescimento, assegurando uma abordagem integrada entre estratégia, gestão, investimento e desenvolvimento do negócio.',
      },
      {
        id: 'bruno',
        name: 'Bruno Carvalho',
        role: 'Co-CEO & Diretor de Operações e Execução',
        body: 'Com mais de 16 anos de experiência na construção e no setor imobiliário, lidera a operação e a execução dos projetos da Luxury Objective. Coordena equipas, arquitetos, engenheiros, fornecedores e parceiros, assegurando o controlo de prazos, custos, processos e qualidade em todas as fases de execução. A sua experiência operacional garante à Luxury Objective a capacidade de transformar projetos e oportunidades em soluções concretas e executáveis.',
      },
    ],
  },
} as const

export const servicos = {
  intro: {
    title: 'Introdução',
    body: 'Na Luxury Objective, cada projeto é conduzido com visão estratégica, rigor técnico e acompanhamento próximo. Desenvolvemos oportunidades imobiliárias e transformamos imóveis através de soluções pensadas para criar valor, funcionalidade e qualidade.',
  },
  desenvolvimento: {
    title: 'Desenvolvimento Imobiliário',
    body: 'Identificamos e estruturamos oportunidades imobiliárias, acompanhando o desenvolvimento dos projetos desde a análise e definição da estratégia até à execução e comercialização.',
    cta: 'Conheça os nossos projetos',
  },
  construcao: {
    title: 'Construção',
    body: 'Desenvolvemos projetos de construção de raiz, assegurando uma gestão integrada e um acompanhamento rigoroso de todas as etapas, desde o planeamento à execução final. Combinamos rigor técnico, controlo financeiro e cumprimento de prazos com uma atenção exigente ao detalhe, garantindo elevados padrões de qualidade e uma execução plenamente alinhada com a visão e os objetivos de cada projeto.',
    // Sem CTA própria aprovada: reutiliza o "Fale connosco" já aprovado.
    cta: 'Fale connosco',
  },
  remodelacao: {
    title: 'Remodelação e Reabilitação',
    body: 'Projetos completos de remodelação e reabilitação, executados com rigor técnico e acabamento premium, do conceito à entrega final. Cada obra é conduzida com controlo próximo de prazos, custos e qualidade, garantindo um resultado à altura do padrão Luxury Objective.',
    cta: 'Ver projetos',
  },
  orcamentos: {
    title: 'Orçamentos & Oportunidades',
    body: 'A Luxury Objective disponibiliza dois percursos de contacto, cada um ajustado ao tipo de pedido pretendido, para garantir uma resposta mais precisa e personalizada.',
    selectors: [
      {
        id: 'remodelacao' as const,
        title: 'Remodelação / Reabilitação',
        description: 'Para quem pretende renovar, reabilitar ou transformar um imóvel existente.',
      },
      {
        id: 'oportunidade' as const,
        title: 'Apresente o seu Projeto ou Oportunidade',
        description:
          'Para proprietários, investidores ou parceiros que pretendam apresentar um terreno, projeto ou oportunidade de desenvolvimento imobiliário.',
      },
    ],
  },
  nota: 'Nota: a Luxury Objective analisa cada pedido de forma personalizada. Entraremos em contacto consigo no prazo máximo de 48h úteis para compreender o seu projeto e apresentar os próximos passos.',
} as const

export const projetos = {
  intro: {
    body: 'A Luxury Objective desenvolve projetos e oportunidades imobiliárias, e transforma imóveis através de projetos de remodelação e reabilitação, unidos pelo mesmo padrão de excelência e rigor técnico. Conheça os projetos em curso e as oportunidades em desenvolvimento.',
  },
  desenvolvimento: { title: 'Desenvolvimento Imobiliário' },
  proximos: { title: 'Próximos Projetos', body: 'Em breve...' },
  remodelacao: { title: 'Projetos de Remodelação & Reabilitação' },
} as const

export const futurosProjetos = {
  title: 'Quer fazer parte de um projeto?',
  body: 'Escolha a opção que melhor descreve o seu interesse. A nossa equipa entra em contacto consigo com a resposta mais adequada ao seu perfil.',
  options: [
    {
      id: 'parceria' as const,
      title: 'Quero estabelecer uma parceria',
      description:
        'Para arquitetos, engenheiros, construtores, consultores, investidores e outros profissionais.',
      cta: 'Quero ser parceiro',
    },
    {
      id: 'terreno' as const,
      title: 'Tenho um terreno ou um projeto',
      description:
        'Tem um terreno, um pré-projeto ou um projeto imobiliário e procura um parceiro para o desenvolver? A Luxury Objective analisa oportunidades e estabelece parcerias para transformar projetos e ativos imobiliários em operações concretas.',
      cta: 'Desenvolver um projeto connosco',
    },
    {
      id: 'proprietario' as const,
      title: 'Quero conhecer os próximos projetos',
      description:
        'Para quem quer ser o primeiro a saber sobre os próximos empreendimentos da Luxury Objective.',
      cta: 'Conhecer projetos',
    },
  ],
} as const

export const contacto = {
  title: 'Fale com a Luxury Objective',
  body: 'Tem um projeto, um terreno, uma oportunidade de investimento ou pretende transformar um imóvel? Estamos disponíveis para analisar o seu projeto e identificar consigo o próximo passo.',
  moradaLabel: 'Morada',
  morada: 'Rua da Cavadinha, n.º 54, 4570-535 Balazar, Póvoa de Varzim',
  contactosLabel: 'Contactos',
  telefones: [
    { label: '+351 912 221 025 (Bruno)', href: 'tel:+351912221025' },
    { label: '+351 252 104 920 (Escritório)', href: 'tel:+351252104920' },
  ],
  emailLabel: 'E-mail',
  email: { label: 'geral@luxuryobjective.com', href: 'mailto:geral@luxuryobjective.com' },
  redesLabel: 'Redes sociais',
  redes: [
    { label: 'Instagram', href: 'https://www.instagram.com/luxuryobjective_/' },
    { label: 'Facebook', href: 'https://www.facebook.com/luxuryobjective/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/luxury-objective-4092aa3b2/' },
  ],
  form: { title: 'Formulário de contacto', cta: 'Enviar mensagem' },
} as const

/** Rótulos de campos e opções — todos literais do PDF aprovado. */
export const forms = {
  remodelacao: {
    title: 'Peça um orçamento para remodelação ou reabilitação',
    cta: 'Solicitar orçamento',
    labels: {
      nome: 'Nome completo',
      email: 'E-mail',
      telemovel: 'Telemóvel',
      localizacao: 'Localização do imóvel',
      tipoImovel: 'Tipo de imóvel',
      area: 'Área aproximada (m²)',
      tipoIntervencao: 'Tipo de intervenção',
      orcamento: 'Orçamento previsto',
      prazo: 'Prazo pretendido',
      descricao: 'Descrição do projeto',
      ficheiros: 'Upload de fotografias ou plantas',
    },
    tipoImovel: ['Apartamento', 'Moradia', 'Espaço comercial', 'Outro'],
    tipoIntervencao: [
      'Remodelação total',
      'Remodelação parcial',
      'Reabilitação de imóvel antigo',
      'Cozinha',
      'Casa de banho',
      'Interior completo',
      'Exterior / fachada',
    ],
    orcamento: [
      'Até 15.000 €',
      '15.000 € – 30.000 €',
      '30.000 € – 60.000 €',
      '60.000 € – 100.000 €',
      'Mais de 100.000 €',
    ],
  },
  oportunidade: {
    title: 'Apresente o seu Projeto ou Oportunidade',
    cta: 'Apresentar oportunidade',
    step1Title: 'Quem é e o que procura?',
    step2Title: 'Informações específicas',
    labels: {
      nome: 'Nome',
      email: 'E-mail',
      telemovel: 'Telemóvel',
      perfil: 'Perfil',
      objetivo: 'Objetivo principal',
    },
    perfil: [
      'Proprietário de terreno',
      'Investidor',
      'Promotor imobiliário',
      'Parceiro / arquiteto / construtor',
      'Outro',
    ],
    objetivo: [
      'Desenvolvimento do projeto',
      'Parceria estratégica',
      'Investimento',
      'Gestão e execução da obra',
      'Comercialização do empreendimento',
      'Análise de viabilidade / oportunidade',
      'Outro',
    ],
    desenvolvimento: {
      labels: {
        localizacao: 'Localização do terreno ou projeto',
        tipoProjeto: 'Tipo de projeto',
        fase: 'Fase do projeto',
        area: 'Área do terreno / imóvel',
        valor: 'Valor estimado de investimento',
        objetivoProjeto: 'Objetivo do projeto',
        descricao: 'Descrição do projeto',
        ficheiros: 'Upload de documentação',
      },
      tipoProjeto: [
        'Moradia',
        'Apartamentos',
        'Empreendimento turístico',
        'Reabilitação urbana',
        'Loteamento',
        'Outro',
      ],
      fase: [
        'Tenho apenas o terreno',
        'Em estudo de viabilidade',
        'Com projeto de arquitetura',
        'Em licenciamento',
        'Pronto para iniciar obra',
      ],
    },
    parceria: {
      labels: {
        areaAtividade: 'Área de atividade',
        tipoParceria: 'Tipo de parceria pretendida',
        experiencia: 'Experiência / empresa',
        portefolio: 'Portefólio ou website',
        descricao: 'Descrição da proposta de parceria',
      },
      areaAtividade: [
        'Arquitetura',
        'Engenharia',
        'Construção',
        'Investimento',
        'Mediação',
        'Outro',
      ],
    },
    investimento: {
      labels: {
        tipoInvestimento: 'Tipo de investimento de interesse',
        faixa: 'Faixa de investimento disponível',
        zona: 'Zona geográfica de interesse',
        objetivoInvestimento: 'Objetivo do investimento',
        mensagem: 'Mensagem adicional',
      },
      tipoInvestimento: [
        'Terrenos',
        'Promoção imobiliária',
        'Reabilitação',
        'Empreendimento turístico',
        'Outro',
      ],
      faixa: ['Até 100.000 €', '100.000 € – 500.000 €', '500.000 € – 1M €', 'Mais de 1M €'],
    },
    gestao: {
      labels: {
        localizacao: 'Localização da obra',
        tipoObra: 'Tipo de obra',
        estado: 'Estado atual',
        prazo: 'Prazo previsto',
        valor: 'Valor estimado de investimento',
        descricao: 'Descrição',
      },
      estado: ['Projeto aprovado', 'Em licenciamento', 'Obra iniciada', 'Obra por iniciar'],
    },
    comercializacao: {
      labels: {
        nomeEmpreendimento: 'Nome do empreendimento (opcional)',
        localizacao: 'Localização',
        tipologia: 'Tipologia do projeto',
        unidades: 'Número de unidades',
        estadoComercial: 'Estado comercial',
        necessidades: 'Necessidades de comercialização',
        ficheiros: 'Upload de apresentação ou brochura',
      },
      estadoComercial: ['Em pré-lançamento', 'Em construção', 'Concluído'],
    },
    viabilidade: {
      labels: {
        localizacao: 'Localização',
        analisar: 'O que pretende analisar?',
        informacao: 'Informação disponível',
        ficheiros: 'Upload de documentos (opcional)',
      },
      analisar: [
        'Potencial construtivo',
        'Viabilidade económica',
        'Melhor uso do ativo',
        'Possível parceria',
        'Outro',
      ],
    },
    outro: { labels: { descricao: 'Descrição livre do que procura' } },
  },
  parceria: {
    cta: 'Quero ser parceiro',
    labels: {
      nome: 'Nome completo',
      empresa: 'Empresa',
      email: 'E-mail',
      telemovel: 'Telemóvel',
      areaAtuacao: 'Área de atuação',
      mensagem: 'Mensagem ou proposta de parceria',
    },
    areaAtuacao: [
      'Arquitetura',
      'Engenharia',
      'Construção',
      'Consultoria',
      'Investimento',
      'Outro',
    ],
  },
  terreno: {
    cta: 'Desenvolver um projeto connosco',
    labels: {
      nome: 'Nome completo',
      email: 'E-mail',
      telemovel: 'Telemóvel',
      localizacao: 'Localização do terreno ou projeto',
      area: 'Área aproximada (m²)',
      mensagem: 'Mensagem ou informações adicionais',
    },
  },
  proprietario: {
    cta: 'Conhecer projetos',
    labels: {
      nome: 'Nome completo',
      email: 'E-mail',
      telemovel: 'Telemóvel',
      mensagem: 'Mensagem (opcional)',
    },
  },
  contacto: {
    cta: 'Enviar mensagem',
    labels: {
      nome: 'Nome',
      email: 'E-mail',
      telemovel: 'Telemóvel',
      assunto: 'Assunto',
      mensagem: 'Mensagem',
    },
    assunto: ['informação geral', 'parceria/investimento', 'orçamento de obra', 'outro'],
  },
} as const

/**
 * Rótulos técnicos de interface. Não existem no PDF aprovado — criados apenas
 * onde não há equivalente aprovado e mantidos curtos, em pt-PT.
 */
export const ui = {
  menu: 'Menu',
  fechar: 'Fechar',
  anterior: 'Anterior',
  seguinte: 'Seguinte',
  removerFicheiro: 'Remover ficheiro',
  saltarParaConteudo: 'Saltar para o conteúdo',
  verProjeto: 'Ver projeto',
  expandir: 'Expandir',
  recolher: 'Fechar',
  toqueParaExpandir: 'Toque para expandir',
  todos: 'Todos',
  filtrar: 'Filtrar projetos',
  semProjetos: 'Sem projetos publicados nesta categoria.',
  sobreProjeto: 'Sobre o projeto',
  fotografiasDe: 'Fotografias de',
  fotoAnterior: 'Fotografia anterior',
  fotoSeguinte: 'Fotografia seguinte',
  campoObrigatorio: 'Campo obrigatório.',
  emailInvalido: 'Indique um e-mail válido.',
  telefoneInvalido: 'Indique um número de telefone válido.',
  erroEnvio: 'Não foi possível enviar. Tente novamente.',
  sucessoEnvio: 'Pedido enviado. Entraremos em contacto consigo.',
  aEnviar: 'A enviar…',
  passo: 'Passo',
  de: 'de',
  ficheirosPermitidos: 'JPG, PNG, WebP, AVIF ou PDF até 10 MB por ficheiro.',
  ficheiroInvalido: 'Formato de ficheiro não permitido.',
  ficheiroGrande: 'Ficheiro demasiado grande.',
  mapaTitulo: 'Ver mapa',
  mapaConsentimento: 'Carregar o mapa a partir do Google Maps.',
  breadcrumb: 'Percurso',
  voltarProjetos: 'Voltar a Projetos',
  projetosRelacionados: 'Outros projetos',
  imagemPendente: 'Imagem por fornecer',
  videoPendente: 'Vídeo por fornecer',
} as const

export const footer = {
  copyright: (year: number) => `© ${year} Luxury Objective. Todos os direitos reservados.`,
  privacidade: 'Política de Privacidade',
  cookies: 'Política de Cookies',
} as const
