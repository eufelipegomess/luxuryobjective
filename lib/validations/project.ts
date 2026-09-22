import { z } from 'zod'
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '@/lib/types'
import { ui } from '@/content/pt-PT'

/** Blocos de narrativa. Estritamente estruturados — nunca HTML livre. */
export const contentBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: z.string().max(4000) }),
  z.object({ type: z.literal('heading'), text: z.string().max(200) }),
  z.object({ type: z.literal('quote'), text: z.string().max(600) }),
  z.object({ type: z.literal('list'), items: z.array(z.string().max(300)).max(20) }),
  z.object({
    type: z.literal('meta'),
    items: z
      .array(z.object({ label: z.string().max(60), value: z.string().max(200) }))
      .max(12),
  }),
])

const optional = (max: number) => z.string().trim().max(max).optional().or(z.literal(''))

/** Focal point aceite pelo CSS `object-position` — só percentagens. */
const focalPoint = z
  .string()
  .regex(/^\d{1,3}% \d{1,3}%$/, 'Formato: "50% 50%"')
  .default('50% 50%')

export const projectSchema = z.object({
  title: z.string().trim().min(1, ui.campoObrigatorio).max(160),
  slug: z
    .string()
    .trim()
    .min(1, ui.campoObrigatorio)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Apenas minúsculas, números e hífenes.'),
  category: z.enum(PROJECT_CATEGORIES),
  status: z.enum(PROJECT_STATUSES),
  excerpt: optional(600),
  location: optional(200),
  year: z
    .union([z.coerce.number().int().min(1900).max(2200), z.literal('')])
    .optional(),
  area: optional(80),
  typology: optional(120),
  coverUrl: optional(600),
  coverAlt: optional(200),
  coverFocalPoint: focalPoint,
  heroVideoUrl: optional(600),
  blocks: z.array(contentBlockSchema).max(60).default([]),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(false),
  seoTitle: optional(160),
  seoDescription: optional(200),
})

export type ProjectInput = z.infer<typeof projectSchema>

export const projectMediaSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().min(1).max(600),
  alt: z.string().max(200).default(''),
  caption: optional(300),
  position: z.number().int().min(0).max(200),
  focalPoint,
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
})

export type ProjectMediaInput = z.infer<typeof projectMediaSchema>
