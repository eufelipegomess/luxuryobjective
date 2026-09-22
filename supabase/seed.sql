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
    'https://ik.imagekit.io/53ddmm7un/img%20capa%20Oluzia.jpeg',
    'Arruamento e fachadas das moradias do O’LUZIA',
    '50% 62%',
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

-- Galeria do O'LUZIA: exteriores, depois interiores, depois vivência. As
-- dimensões reais deixam a galeria desenhar a moldura pela fotografia.
insert into public.project_media (project_id, url, alt, position, width, height)
select
  p.id,
  'https://ik.imagekit.io/53ddmm7un/OLUZIA/' || g.file,
  g.alt,
  g.position,
  g.width,
  g.height
from public.projects p
cross join (
  values
    ('fachada%20luxo%20%C3%A1%20noite.jpg', 'Moradia do O’LUZIA com piscina, ao anoitecer', 0, 3280, 1845),
    ('1a.jpg', 'Fachada de uma moradia do O’LUZIA', 1, 2400, 3000),
    ('fachada_oluzia_rua_final_ultra%20(1)%20(1).png', 'Arruamento e fachadas das moradias do O’LUZIA', 2, 1632, 2176),
    ('2_PP.jpg', 'Moradia do O’LUZIA com zona de estar exterior', 3, 2560, 1440),
    ('projeto_fotorrealista%20(1).png', 'Fachada e arruamento do O’LUZIA', 4, 1632, 2176),
    ('4a.jpg', 'Piscina e zona de estar exterior', 5, 2400, 3000),
    ('2_PP_1%20(1).jpg', 'Moradia do O’LUZIA com piscina', 6, 2560, 1440),
    ('WhatsApp%20Image%202026-07-16%20at%2011.58.42%20(3).jpeg', 'Piscina interior coberta', 7, 2048, 1152),
    ('image%20(10).png', 'Sala de estar com escada e pátio interior', 8, 1632, 2176),
    ('K8yTrLMlfu1CnArAXfTu9X-img-3_1784210120000_na1fn_aW50ZXJpb3JfbGlmZXN0eWxlXzM.webp', 'Sala de estar vista do piso superior', 9, 1632, 2176),
    ('3%20(2)%20(1).jpg', 'Sala de estar e zona de refeições', 10, 3000, 1688),
    ('IMG_4860.webp', 'Escada interior em madeira com iluminação embutida', 11, 1664, 2080),
    ('WhatsApp%20Image%202026-07-16%20at%2011.58.42%20(1).jpeg', 'Quarto ao nascer do sol', 12, 1638, 2048),
    ('quarto_lifestyle_cha_corrigido%20(1).png', 'Quarto ao fim da tarde', 13, 1440, 2560),
    ('bathroom_sink_vanity.png', 'Casa de banho em mármore', 14, 1664, 2080),
    ('bathroom_story_3%20(1).png', 'Casa de banho com duche e bancada dupla', 15, 1440, 2560),
    ('532489808_18045216527643996_5965576437815426897_n%20(2).jpg', 'Sala de estar com vista para o jardim', 16, 1170, 1170),
    ('ChatGPT%20Image%2016_07_2026,%2015_19_52.png', 'Zona de leitura junto ao pátio interior', 17, 1254, 1254),
    ('instagram_table_setting_1.png', 'Mesa de jantar posta', 18, 1920, 1920),
    ('family_interaction_dining.png', 'Refeição em família na sala de jantar', 19, 1920, 1920),
    ('breakfast_closeup_lifestyle.png', 'Pequeno-almoço na cozinha', 20, 1920, 1920)
) as g(file, alt, position, width, height)
where p.slug = 'o-luzia'
  and not exists (select 1 from public.project_media m where m.project_id = p.id);
