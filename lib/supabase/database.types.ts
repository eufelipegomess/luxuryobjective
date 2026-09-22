import type { ContentBlock, ProjectCategory, ProjectStatus, SubmissionKind } from '@/lib/types'

/**
 * Tipos das linhas, escritos à mão a partir de `supabase/migrations`.
 * Mantê-los aqui — em vez de gerar — evita uma dependência de CLI no build e
 * dá-nos `ContentBlock` tipado em vez de `Json`.
 */

export type ProjectRow = {
  id: string
  slug: string
  title: string
  category: ProjectCategory
  status: ProjectStatus
  excerpt: string | null
  location: string | null
  year: number | null
  area: string | null
  typology: string | null
  cover_url: string | null
  cover_alt: string | null
  cover_focal_point: string
  hero_video_url: string | null
  blocks: ContentBlock[]
  featured: boolean
  display_order: number
  published: boolean
  archived: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export type ProjectMediaRow = {
  id: string
  project_id: string
  url: string
  alt: string
  caption: string | null
  position: number
  focal_point: string
  width: number | null
  height: number | null
  created_at: string
}

export type FormSubmissionRow = {
  id: string
  kind: SubmissionKind
  payload: Record<string, unknown>
  files: { path: string; name: string; size: number; type: string }[]
  ip_hash: string | null
  user_agent: string | null
  handled: boolean
  created_at: string
}

export type AdminUserRow = {
  user_id: string
  email: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow
        Insert: Partial<ProjectRow> & Pick<ProjectRow, 'slug' | 'title' | 'category' | 'status'>
        Update: Partial<ProjectRow>
        Relationships: []
      }
      project_media: {
        Row: ProjectMediaRow
        Insert: Partial<ProjectMediaRow> & Pick<ProjectMediaRow, 'project_id' | 'url'>
        Update: Partial<ProjectMediaRow>
        // A chave estrangeira tem de estar declarada: sem ela o
        // `select('*, project_media(*)')` não sabe resolver o embed.
        Relationships: [
          {
            foreignKeyName: 'project_media_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      form_submissions: {
        Row: FormSubmissionRow
        Insert: Pick<FormSubmissionRow, 'kind' | 'payload'> & Partial<FormSubmissionRow>
        Update: Partial<FormSubmissionRow>
        Relationships: []
      }
      admin_users: {
        Row: AdminUserRow
        Insert: AdminUserRow
        Update: Partial<AdminUserRow>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
    }
    Enums: {
      project_category: ProjectCategory
      project_status: ProjectStatus
      submission_kind: SubmissionKind
    }
    CompositeTypes: { [_ in never]: never }
  }
}
