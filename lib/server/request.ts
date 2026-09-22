import 'server-only'
import { createHash } from 'node:crypto'

/**
 * Identificação do pedido para efeitos de rate limiting.
 *
 * Guardamos apenas um hash do IP com um sal do ambiente: chega para travar
 * abuso e não deixa o endereço em claro na base de dados.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headers.get('x-real-ip') ?? 'desconhecido'
}

export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? 'luxury-objective'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

/**
 * Janela deslizante em memória. Numa única instância chega; em serverless
 * multi-região é uma primeira barreira, e a validação server-side e o honeypot
 * seguram o resto. Sem CAPTCHA — o briefing proíbe.
 */
export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) return false

  bucket.count += 1
  return true
}

/** Evita que o Map cresça sem limite em processos de vida longa. */
export function pruneRateLimit(): void {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}
