/**
 * Textos legais.
 *
 * Descrevem o que o site faz mesmo, não um modelo copiado: os campos são os
 * dos seis formulários, os subcontratantes são os que servem as páginas, e a
 * parte dos cookies diz que não há nenhum no site público porque não há.
 * Sempre que o site mudar — uma ferramenta de estatísticas, um pixel, um chat
 * — estes textos mudam com ele.
 *
 * A data é a da última revisão e aparece no fim de cada documento.
 */

export const legalUpdatedAt = '25 de setembro de 2026'

export type LegalSection = {
  title: string
  paragraphs?: string[]
  list?: string[]
  /** Fecha a secção depois da lista — onde dizer o que fazer com ela. */
  listFooter?: string
}

export type LegalDocument = {
  title: string
  intro: string
  sections: LegalSection[]
}

export const privacidade: LegalDocument = {
  title: 'Política de Privacidade',
  intro:
    'Esta política explica que dados pessoais a Luxury Objective recolhe através deste site, porquê, durante quanto tempo os guarda e que direitos lhe assistem. Está escrita para ser lida, não para ser assinada sem se perceber.',
  sections: [
    {
      title: 'Quem trata os seus dados',
      paragraphs: [
        'O responsável pelo tratamento é a Luxury Objective, com morada na Rua da Cavadinha, n.º 54, 4570-535 Balazar, Póvoa de Varzim, Portugal.',
        'Para qualquer assunto relacionado com dados pessoais, incluindo o exercício dos seus direitos, escreva para geral@luxuryobjective.com ou ligue para +351 912 221 025.',
      ],
    },
    {
      title: 'Que dados recolhemos',
      paragraphs: [
        'Apenas os que nos dá de livre vontade nos formulários do site, e os estritamente técnicos necessários a mantê-lo seguro. Consoante o formulário que preencher, pedimos:',
      ],
      list: [
        'Nome, endereço de e-mail e número de telemóvel — em todos os formulários.',
        'Empresa e área de atuação — apenas no formulário de parceria.',
        'A mensagem, a descrição do imóvel, do terreno ou da oportunidade que nos quiser apresentar.',
        'Ficheiros que decida anexar, como plantas, fotografias ou documentos do projeto.',
      ],
    },
    {
      title: 'Dados técnicos',
      paragraphs: [
        'Quando um formulário é submetido, guardamos também o identificador do seu navegador e uma versão cifrada e irreversível do seu endereço IP. Não guardamos o endereço IP em si e não é possível reconstruí-lo a partir do que guardamos.',
        'Servem um único fim: impedir que o mesmo remetente submeta centenas de formulários seguidos. Não são usados para o identificar, para publicidade, nem para medir o seu comportamento no site.',
        'Este site não tem ferramentas de estatísticas, não tem pixéis de publicidade e não partilha nada com redes sociais. A navegação nas páginas não é registada.',
      ],
    },
    {
      title: 'Porque podemos tratar estes dados',
      paragraphs: [
        'Quando nos escreve a pedir um orçamento, a apresentar um terreno ou a propor uma parceria, o tratamento assenta nas diligências pré-contratuais que pediu — alínea b) do n.º 1 do artigo 6.º do Regulamento Geral sobre a Proteção de Dados.',
        'Os dados técnicos acima assentam no nosso interesse legítimo em manter o site em funcionamento e protegido de abuso — alínea f) do mesmo artigo.',
        'Não usamos os seus dados para lhe enviar comunicações de marketing. Se um dia o fizermos, será com o seu consentimento expresso e com forma de o retirar em cada mensagem.',
      ],
    },
    {
      title: 'Quem tem acesso',
      paragraphs: [
        'A equipa da Luxury Objective, e apenas na medida do necessário para responder ao seu pedido. Não vendemos, não alugamos e não cedemos dados pessoais a terceiros para fins comerciais.',
        'Três empresas tratam dados por nossa conta, com contrato e apenas segundo as nossas instruções:',
      ],
      list: [
        'Supabase, Inc. — base de dados e armazenamento dos ficheiros que anexar.',
        'Hostinger International Ltd. — alojamento do site.',
        'ImageKit — entrega das fotografias das páginas. Não recebe dados de formulários.',
      ],
    },
    {
      title: 'Onde ficam guardados',
      paragraphs: [
        'A base de dados e os ficheiros estão alojados em servidores no Canadá.',
        'A Comissão Europeia reconheceu que o Canadá assegura um nível adequado de proteção de dados pessoais, pela Decisão 2002/2/CE, pelo que esta transferência não depende de garantias adicionais. Os restantes tratamentos decorrem na União Europeia.',
      ],
    },
    {
      title: 'Durante quanto tempo',
      paragraphs: [
        'Guardamos os pedidos de contacto durante dois anos a contar da última comunicação consigo. Se o contacto der origem a um projeto, os dados necessários acompanham esse projeto e obedecem aos prazos legais aplicáveis, nomeadamente fiscais.',
        'Findo o prazo, os dados são apagados. Pode pedir-nos que o façam antes disso.',
      ],
    },
    {
      title: 'Os seus direitos',
      paragraphs: [
        'Sobre os seus dados pessoais, a lei dá-lhe direito a:',
      ],
      list: [
        'Saber que dados temos e obter uma cópia.',
        'Corrigir o que esteja errado ou incompleto.',
        'Pedir que sejam apagados.',
        'Pedir que o tratamento seja limitado, enquanto uma questão estiver por resolver.',
        'Receber os dados num formato legível por computador, ou pedir que os enviemos a outra entidade.',
        'Opor-se a um tratamento que assente no nosso interesse legítimo.',
      ],
      listFooter:
        'Basta escrever para geral@luxuryobjective.com. Respondemos no prazo de um mês. Se entender que não tratámos o assunto como devíamos, pode apresentar reclamação à Comissão Nacional de Proteção de Dados, em www.cnpd.pt.',
    },
    {
      title: 'Decisões automatizadas',
      paragraphs: [
        'Não tomamos decisões automatizadas sobre si nem fazemos definição de perfis. Quem lê o que nos escreve, e quem responde, é uma pessoa.',
      ],
    },
    {
      title: 'Menores',
      paragraphs: [
        'Este site dirige-se a adultos e não recolhe conscientemente dados de menores de 16 anos. Se souber que um menor nos enviou dados, avise-nos e apagamo-los.',
      ],
    },
    {
      title: 'Alterações a esta política',
      paragraphs: [
        'Se o site passar a recolher outros dados, ou a usar outras ferramentas, esta política muda antes disso acontecer e a data no fim é atualizada. Vale sempre a versão publicada nesta página.',
      ],
    },
  ],
}

export const cookies: LegalDocument = {
  title: 'Política de Cookies',
  intro:
    'Cookies são ficheiros pequenos que um site guarda no seu dispositivo para se lembrar de alguma coisa entre páginas. Este site usa muito poucos, e nenhum no lado público — por isso também não lhe aparece aquela janela a pedir autorização.',
  sections: [
    {
      title: 'No site público, nenhum',
      paragraphs: [
        'Navegar pelas páginas deste site — início, empresa, serviços, projetos, contacto — não guarda cookies no seu dispositivo.',
        'Não há ferramentas de estatísticas, não há pixéis de publicidade, não há botões de redes sociais que sigam a sua navegação. Preencher um formulário também não guarda cookies: a mensagem é enviada e fica na nossa base de dados, como explicado na Política de Privacidade.',
      ],
    },
    {
      title: 'Na área reservada, os indispensáveis',
      paragraphs: [
        'A área de administração, em /admin, é usada apenas pela equipa da Luxury Objective para gerir os conteúdos do site. Aí são guardados cookies de sessão, que servem para manter quem entrou com sessão iniciada e para proteger os formulários internos.',
        'São cookies estritamente necessários: sem eles a autenticação não funciona. Duram enquanto a sessão durar e são apagados ao terminar sessão. Não seguem ninguém e não têm qualquer relação com a navegação no site público.',
      ],
    },
    {
      title: 'Porque não lhe pedimos autorização',
      paragraphs: [
        'A lei exige consentimento para cookies que não sejam indispensáveis ao funcionamento do serviço pedido — é o que diz o artigo 5.º da Lei n.º 41/2004. Como o site público não usa nenhum, e os da área reservada são estritamente necessários a quem lá entra, não há nada a consentir.',
        'Se um dia passarmos a usar estatísticas ou outra ferramenta que o exija, passará a existir um pedido de autorização claro, que poderá recusar sem perder acesso ao site.',
      ],
    },
    {
      title: 'Como controlar cookies no seu navegador',
      paragraphs: [
        'Independentemente do que este site faça, o seu navegador dá-lhe sempre a última palavra. Nas definições de qualquer navegador — Chrome, Safari, Firefox, Edge — consegue ver os cookies guardados, apagá-los e bloquear os de sites que escolher.',
        'Bloquear cookies neste site não afeta a leitura de nenhuma página.',
      ],
    },
    {
      title: 'Alterações a esta política',
      paragraphs: [
        'Esta página é atualizada sempre que o site mudar a forma como usa cookies, e a data no fim acompanha essa alteração.',
      ],
    },
  ],
}
