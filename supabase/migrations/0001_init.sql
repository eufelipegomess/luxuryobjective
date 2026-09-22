-- =============================================================================
-- Luxury Objective — esquema inicial
-- =============================================================================
-- Princípios:
--  * o site público só consegue ler projetos publicados e não arquivados;
--  * escrita exclusiva de administradores, verificada por RLS e não pela UI;
--  * submissões de formulário nunca são legíveis nem escritas pelo cliente —
--    entram apenas pela service_role, a partir das route handlers.

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Administradores
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Lista de utilizadores com permissão de escrita. Ser admin nunca é inferido do cliente.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- Projetos
-- -----------------------------------------------------------------------------
create type public.project_category as enum ('desenvolvimento', 'remodelacao');
create type public.project_status as enum (
  'em-execucao', 'em-desenvolvimento', 'concluido', 'em-breve'
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category public.project_category not null,
  status public.project_status not null,
  excerpt text,
  location text,
  year integer,
  area text,
  typology text,
  cover_url text,
  cover_alt text,
  cover_focal_point text not null default '50% 50%',
  hero_video_url text,
  -- Blocos estruturados e validados por Zod na aplicação. Nunca HTML livre:
  -- o painel não pode injetar markup arbitrário no site público.
  blocks jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  display_order integer not null default 0,
  published boolean not null default false,
  archived boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_year_range check (year is null or (year between 1900 and 2200)),
  constraint projects_blocks_is_array check (jsonb_typeof(blocks) = 'array')
);

create index if not exists projects_slug_idx on public.projects (slug);
create index if not exists projects_category_idx on public.projects (category);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_published_idx on public.projects (published, archived);
create index if not exists projects_order_idx on public.projects (display_order, created_at desc);

-- -----------------------------------------------------------------------------
-- Galeria
-- -----------------------------------------------------------------------------
create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url text not null,
  alt text not null default '',
  caption text,
  position integer not null default 0,
  focal_point text not null default '50% 50%',
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index if not exists project_media_project_idx
  on public.project_media (project_id, position);

-- -----------------------------------------------------------------------------
-- Submissões de formulário
-- -----------------------------------------------------------------------------
create type public.submission_kind as enum (
  'remodelacao', 'oportunidade', 'parceria', 'terreno', 'proprietario', 'contacto'
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  kind public.submission_kind not null,
  payload jsonb not null,
  files jsonb not null default '[]'::jsonb,
  -- Hash, não o IP em claro: chega para limitar abuso sem guardar o endereço.
  ip_hash text,
  user_agent text,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists form_submissions_kind_idx
  on public.form_submissions (kind, created_at desc);
create index if not exists form_submissions_rate_idx
  on public.form_submissions (ip_hash, created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.form_submissions enable row level security;
alter table public.admin_users enable row level security;

-- Público: só o que está publicado e não arquivado.
create policy "projects_public_read" on public.projects
  for select using (published = true and archived = false);

create policy "projects_admin_all" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

create policy "project_media_public_read" on public.project_media
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.published = true and p.archived = false
    )
  );

create policy "project_media_admin_all" on public.project_media
  for all using (public.is_admin()) with check (public.is_admin());

-- Sem política de INSERT para anon: as submissões entram só pela service_role.
create policy "form_submissions_admin_read" on public.form_submissions
  for select using (public.is_admin());

create policy "form_submissions_admin_update" on public.form_submissions
  for update using (public.is_admin()) with check (public.is_admin());

create policy "admin_users_self_read" on public.admin_users
  for select using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Storage
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

create policy "project_media_read" on storage.objects
  for select using (bucket_id = 'project-media');

create policy "project_media_admin_write" on storage.objects
  for insert with check (bucket_id = 'project-media' and public.is_admin());

create policy "project_media_admin_update" on storage.objects
  for update using (bucket_id = 'project-media' and public.is_admin());

create policy "project_media_admin_delete" on storage.objects
  for delete using (bucket_id = 'project-media' and public.is_admin());

-- O bucket de submissões não tem política pública: apenas service_role e admin.
create policy "submissions_admin_read" on storage.objects
  for select using (bucket_id = 'submissions' and public.is_admin());
