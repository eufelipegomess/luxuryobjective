-- =============================================================================
-- Seed mínimo — Luxury Objective
-- =============================================================================
-- Nome e estado vêm do PDF aprovado; as fotografias, do cliente (ImageKit).
--
-- As descrições são PROVISÓRIAS: texto de exemplo para a aprovação, escrito só
-- a partir do que se sabe, a substituir pelo cliente no painel. Ano e área
-- ficam vazios e o site omite-os.
--
-- O mesmo conteúdo está em `lib/queries/fallback.ts`, que é o que o site usa
-- quando não há Supabase configurado. Mantém os dois em sintonia.

insert into public.projects (
  slug, title, category, status, featured, display_order, published,
  cover_url, cover_alt, cover_focal_point, excerpt, location, typology, blocks
)
values
  (
    'o-luzia', 'O''LUZIA', 'desenvolvimento', 'em-execucao', true, 1, true,
    'https://ik.imagekit.io/53ddmm7un/LOTE%2001/Fachada%20(frente).jpg?updatedAt=1790251417599',
    'Fachada de uma das moradias do O’LUZIA',
    '50% 43%',
    'Conjunto de cinco moradias contemporâneas desenvolvido pela Luxury Objective, atualmente em execução. Linhas depuradas, espaços exteriores generosos e acabamentos de elevado padrão.',
    'Vila do Conde',
    'Moradias unifamiliares',
    '[{"type": "paragraph", "text": "O empreendimento reúne cinco moradias independentes, pensadas para quem procura conforto, privacidade e qualidade de construção. Cada casa combina áreas sociais amplas e luminosas com zonas privadas bem resolvidas, sempre em relação com o exterior."}, {"type": "paragraph", "text": "A Luxury Objective acompanha o empreendimento de forma integrada — da estruturação à execução em obra — com controlo de prazos, custos e qualidade em cada fase."}, {"type": "heading", "text": "Destaques"}, {"type": "list", "items": ["Cinco moradias independentes", "Arquitetura contemporânea, com grandes vãos envidraçados", "Piscinas e zonas exteriores de estar", "Interiores amplos, com luz natural e pé-direito generoso", "Acompanhamento integrado, da estruturação à execução"]}]'::jsonb
  ),
  (
    'macieira-da-maia', 'MACIEIRA DA MAIA', 'desenvolvimento', 'em-desenvolvimento', true, 2, true,
    null, null, '50% 50%',
    'Projeto de desenvolvimento imobiliário em Macieira da Maia, atualmente em fase de desenvolvimento. Mais detalhes serão divulgados em breve.',
    'Macieira da Maia',
    null,
    '[{"type": "paragraph", "text": "Em fase de estudo e estruturação, o projeto segue a abordagem integrada que orienta toda a atividade da Luxury Objective — da análise da oportunidade à execução e comercialização."}]'::jsonb
  )
on conflict (slug) do nothing;

-- Só para arrancar um projeto Supabase de raiz. Para mudar a galeria de um
-- que já existe, usar `npm run sincronizar`, que lê
-- `content/oluzia-galeria.json` — esta lista é gerada a partir do mesmo
-- ficheiro e tem de continuar a sê-lo.
--
-- Galeria do O'LUZIA: as cinco moradias, uma de cada vez. Dentro de cada uma
-- abrem os exteriores e só depois entram os interiores. A legenda marca o
-- início de cada moradia. As dimensões reais reservam o espaço na página; o
-- ponto focal só interessa às poucas que não são 16:9 e por isso cortam.
insert into public.project_media (project_id, url, alt, caption, focal_point, position, width, height)
select p.id, g.url, g.alt, g.caption, g.focal_point, g.position, g.width, g.height
from public.projects p
cross join (
  values
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Fachada%20(frente).jpg?updatedAt=1790251417599', 'Moradia 1 do O’LUZIA vista da frente', 'Moradia 1', '50% 50%', 0, 2560, 1440),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Piscina.jpg?updatedAt=1790251418398', 'Piscina e zona exterior de estar da moradia 1', null, '50% 50%', 1, 2560, 1440),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Sala.jpg?updatedAt=1790251417361', 'Sala de estar da moradia 1', null, '50% 50%', 2, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Sala%20.jpg?updatedAt=1790251418050', 'Sala de estar da moradia 1, de outro ângulo', null, '50% 50%', 3, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Quarto%20.jpg?updatedAt=1790251417482', 'Quarto principal da moradia 1', null, '50% 50%', 4, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Penteadeira.jpg?updatedAt=1790251418089', 'Zona de penteadeira no quarto da moradia 1', null, '50% 50%', 5, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Corredor.jpg?updatedAt=1790251417322', 'Corredor de acesso aos quartos da moradia 1', null, '50% 50%', 6, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Casa%20de%20banho.jpg?updatedAt=1790251417347', 'Casa de banho da moradia 1', null, '50% 50%', 7, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Escada.jpg?updatedAt=1790251416792', 'Escada interior da moradia 1', null, '50% 50%', 8, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Tv.jpg?updatedAt=1790251416580', 'Zona de televisão da moradia 1', null, '50% 50%', 9, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2001/Cozinha.jpg?updatedAt=1790251416322', 'Cozinha da moradia 1', null, '50% 50%', 10, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Fachada%20(Frente).jpg?updatedAt=1790251498495', 'Moradia 2 do O’LUZIA vista da frente', 'Moradia 2', '50% 50%', 11, 2560, 1440),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Piscina%20(exterior).jpg?updatedAt=1790251497121', 'Piscina exterior da moradia 2', null, '50% 50%', 12, 2560, 1440),
    ('https://ik.imagekit.io/53ddmm7un/sala%20lote%2002.jpeg', 'Sala de estar da moradia 2', null, '50% 50%', 13, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-%20Casa%20de%20banho%20(casal).jpg?updatedAt=1790251503395', 'Casa de banho da suíte da moradia 2', null, '50% 50%', 14, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal-%20Casa%20de%20banho.jpg?updatedAt=1790251504567', 'Casa de banho da moradia 2', null, '50% 50%', 15, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Cozinha.jpg?updatedAt=1790251505361', 'Cozinha da moradia 2', null, '50% 50%', 16, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Quarto.jpg?updatedAt=1790251506039', 'Quarto da moradia 2', null, '50% 50%', 17, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Quarto%20(lateral).jpg?updatedAt=1790251505782', 'Quarto da moradia 2, vista lateral', null, '50% 50%', 18, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-%20closet%20.png?updatedAt=1790251507130', 'Closet da moradia 2', null, '50% 50%', 19, 2560, 1440),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2002/Horizontal%20-Escada.jpg?updatedAt=1790251506198', 'Escada interior da moradia 2', null, '50% 50%', 20, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Fachada%20(frente).png?updatedAt=1790251548988', 'Moradia 3 do O’LUZIA vista da frente', 'Moradia 3', '50% 50%', 21, 1672, 941),
    ('https://ik.imagekit.io/53ddmm7un/piscina%20lote%2003.png', 'Piscina exterior da moradia 3', null, '50% 50%', 22, 1672, 941),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-Sala.jpg?updatedAt=1790251549205', 'Sala de estar da moradia 3', null, '50% 50%', 23, 3280, 1845),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Quarto.png?updatedAt=1790251548884', 'Quarto da moradia 3', null, '50% 50%', 24, 1672, 940),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Cozinha_.png?updatedAt=1790251546940', 'Cozinha da moradia 3', null, '50% 50%', 25, 1672, 941),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Sala%20de%20jantar.jpg?updatedAt=1790251538228', 'Sala de jantar da moradia 3', null, '50% 50%', 26, 1408, 1056),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20corredor%20(oficial).png?updatedAt=1790251548547', 'Corredor da moradia 3', null, '50% 50%', 27, 1672, 941),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-%20Escrit%C3%B3rio%20golden%20Hour.jpg?updatedAt=1790251538240', 'Escritório da moradia 3 ao fim da tarde', null, '50% 50%', 28, 1672, 941),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2003/Horizontal%20-Casa%20de%20banho.jpg?updatedAt=1790251544623', 'Casa de banho da moradia 3', null, '50% 50%', 29, 3280, 1845),
    ('https://ik.imagekit.io/53ddmm7un/img%20casa%20lote%2004%201.PNG', 'Moradia 4 do O’LUZIA vista da frente', 'Moradia 4', '50% 50%', 30, 1672, 941),
    ('https://ik.imagekit.io/53ddmm7un/img%20casa%20lote%2004%202.PNG', 'Moradia 4 do O’LUZIA vista de trás', null, '50% 40%', 31, 1115, 939),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal%20-%20Sala.png?updatedAt=1790251604909', 'Sala de estar da moradia 4', null, '50% 50%', 32, 1672, 941),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal%20-%20Sala%20de%20Jantar.png?updatedAt=1790251603927', 'Sala de jantar da moradia 4', null, '50% 50%', 33, 1671, 941),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal-%20Quarto%20amadeirado%20frontal.png?updatedAt=1790251603714', 'Quarto em madeira da moradia 4, vista frontal', null, '50% 50%', 34, 1520, 941),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2004/horizontal%20-%20quarto%20ros%C3%A9.png?updatedAt=1790251613161', 'Quarto em tons rosé da moradia 4', null, '50% 50%', 35, 1370, 939),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal%20-%20Quarto%20amadeirado.png?updatedAt=1790251602067', 'Quarto em madeira da moradia 4', null, '50% 50%', 36, 1672, 941),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2004/Horizontal%20-%20cozinha.png?updatedAt=1790251601920', 'Cozinha da moradia 4', null, '50% 50%', 37, 1672, 941),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2004/horizontal%20-%20hall%20.png?updatedAt=1790251600480', 'Hall de entrada da moradia 4', null, '50% 50%', 38, 1396, 941),
    ('https://ik.imagekit.io/53ddmm7un/img%20casa%20lote%2005%20frente.jpeg', 'Moradia 5 do O’LUZIA vista da frente', 'Moradia 5', '50% 50%', 39, 2560, 1440),
    ('https://ik.imagekit.io/53ddmm7un/img%20casa%20lote%2005%20tr%C3%A1s.jpeg', 'Moradia 5 do O’LUZIA vista de trás, com piscina', null, '50% 50%', 40, 2560, 1440),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2005/Piscina%20interior%20(of.).jpg?updatedAt=1790251667328', 'Piscina interior da moradia 5', null, '50% 50%', 41, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2005/Sinuca%20-%20Sala%20(vers%C3%A3o%20of.).jpg?updatedAt=1790251669512', 'Sala com mesa de bilhar da moradia 5', null, '50% 50%', 42, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2005/Cozinha%20(of.).jpg?updatedAt=1790251667687', 'Cozinha da moradia 5', null, '50% 50%', 43, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2005/Quarto%20(of.).jpg?updatedAt=1790251667691', 'Quarto da moradia 5', null, '50% 50%', 44, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2005/Sala%20de%20Jantar%20(of.).jpg?updatedAt=1790251668753', 'Sala de jantar da moradia 5', null, '50% 50%', 45, 3000, 1688),
    ('https://ik.imagekit.io/53ddmm7un/LOTE%2005/Sala%20(vers%C3%A3o%20of.).jpg?updatedAt=1790251669477', 'Sala de estar da moradia 5', null, '50% 50%', 46, 3000, 1688)
) as g(url, alt, caption, focal_point, position, width, height)
where p.slug = 'o-luzia'
  and not exists (select 1 from public.project_media m where m.project_id = p.id);
