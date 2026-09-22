'use client'

import { useFormContext, type FieldValues, type Path } from 'react-hook-form'
import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Campos de formulário partilhados.
 *
 * Regras fixas em todos: label persistente (nunca só placeholder), altura
 * mínima de 48px em mobile, erro ligado por `aria-describedby` e `aria-invalid`
 * — e o erro é anunciado, não apenas colorido.
 */

const controlBase =
  'w-full min-h-[52px] border border-line bg-ink-raised px-4 py-3 text-bone transition-colors duration-200 placeholder:text-bone-muted/50 focus:border-gold focus:outline-none aria-[invalid=true]:border-gold'

function useFieldIds(name: string) {
  const uid = useId()
  return { inputId: `${uid}-${name}`, errorId: `${uid}-${name}-erro` }
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-eyebrow text-bone-muted">
      {children}
    </label>
  )
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 flex items-center gap-2 text-sm text-gold">
      {/* O estado não é comunicado só por cor: há um marcador e texto. */}
      <span aria-hidden="true">—</span>
      {message}
    </p>
  )
}

type BaseProps<T extends FieldValues> = {
  name: Path<T>
  label: string
  className?: string
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
}

export function TextField<T extends FieldValues>({
  name,
  label,
  className,
  autoComplete,
  inputMode,
  type = 'text',
}: BaseProps<T> & { type?: 'text' | 'email' | 'tel' }) {
  const { register, formState } = useFormContext<T>()
  const { inputId, errorId } = useFieldIds(name)
  const message = getMessage(formState.errors, name)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <input
        id={inputId}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errorId : undefined}
        className={controlBase}
        {...register(name)}
      />
      <ErrorText id={errorId} message={message} />
    </div>
  )
}

export function TextAreaField<T extends FieldValues>({
  name,
  label,
  className,
  rows = 5,
}: BaseProps<T> & { rows?: number }) {
  const { register, formState } = useFormContext<T>()
  const { inputId, errorId } = useFieldIds(name)
  const message = getMessage(formState.errors, name)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errorId : undefined}
        className={cn(controlBase, 'resize-y')}
        {...register(name)}
      />
      <ErrorText id={errorId} message={message} />
    </div>
  )
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  className,
}: BaseProps<T> & { options: readonly string[] }) {
  const { register, formState } = useFormContext<T>()
  const { inputId, errorId } = useFieldIds(name)
  const message = getMessage(formState.errors, name)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        {/* Sem `defaultValue`: combiná-lo com o `register` faz o React Hook
            Form perder o valor do select num re-render (por exemplo, depois de
            uma validação falhada). O estado inicial vem de `defaultValues`. */}
        <select
          id={inputId}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          className={cn(controlBase, 'appearance-none pr-12')}
          {...register(name)}
        >
          <option value="" disabled />
          {options.map((option) => (
            <option key={option} value={option} className="bg-ink text-bone">
              {option}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 block h-2 w-2 -translate-y-2/3 rotate-45 border-b border-r border-bone-muted"
        />
      </div>
      <ErrorText id={errorId} message={message} />
    </div>
  )
}

/**
 * Honeypot. Escondido de olhos e de leitores de ecrã, fora da ordem de tab —
 * um humano nunca o preenche, um bot preenche quase sempre.
 */
export function Honeypot<T extends FieldValues>() {
  const { register } = useFormContext<T>()
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="website-hp">Website</label>
      <input id="website-hp" type="text" tabIndex={-1} autoComplete="off" {...register('website' as Path<T>)} />
    </div>
  )
}

function getMessage(errors: Record<string, unknown>, name: string): string | undefined {
  const entry = errors[name] as { message?: unknown } | undefined
  return typeof entry?.message === 'string' ? entry.message : undefined
}
