'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField, Honeypot } from './Fields'
import { FormStatus } from './FormStatus'
import { useSubmitForm } from './useSubmitForm'
import {
  contactoSchema,
  parceriaSchema,
  proprietarioSchema,
  terrenoSchema,
  type ContactoInput,
  type ParceriaInput,
  type ProprietarioInput,
  type TerrenoInput,
} from '@/lib/validations/forms'
import { forms } from '@/content/pt-PT'

const shell = 'relative flex flex-col gap-8'
const grid = 'grid grid-cols-1 gap-6 md:grid-cols-2'

/** Opção 1 da área de futuros projetos — profissional / parceiro. */
export function ParceriaForm() {
  const copy = forms.parceria
  const form = useForm<ParceriaInput>({
    resolver: zodResolver(parceriaSchema),
    mode: 'onBlur',
    defaultValues: { website: '' },
  })
  const { status, message, submit, focusFirstError } = useSubmitForm('parceria', form)

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(submit, focusFirstError)} className={shell}>
        <Honeypot<ParceriaInput> />
        <div className={grid}>
          <TextField<ParceriaInput> name="nome" label={copy.labels.nome} autoComplete="name" />
          <TextField<ParceriaInput>
            name="empresa"
            label={copy.labels.empresa}
            autoComplete="organization"
          />
          <TextField<ParceriaInput>
            name="email"
            label={copy.labels.email}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <TextField<ParceriaInput>
            name="telemovel"
            label={copy.labels.telemovel}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
          <SelectField<ParceriaInput>
            name="areaAtuacao"
            label={copy.labels.areaAtuacao}
            options={copy.areaAtuacao}
            className="md:col-span-2"
          />
        </div>
        <TextAreaField<ParceriaInput> name="mensagem" label={copy.labels.mensagem} rows={6} />
        <FormStatus status={status} message={message} />
        <div>
          <Button type="submit" variant="primary" withArrow disabled={status === 'sending'}>
            {copy.cta}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

/** Opção 2 — tenho um terreno ou um projeto. */
export function TerrenoForm() {
  const copy = forms.terreno
  const form = useForm<TerrenoInput>({
    resolver: zodResolver(terrenoSchema),
    mode: 'onBlur',
    defaultValues: { website: '' },
  })
  const { status, message, submit, focusFirstError } = useSubmitForm('terreno', form)

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(submit, focusFirstError)} className={shell}>
        <Honeypot<TerrenoInput> />
        <div className={grid}>
          <TextField<TerrenoInput> name="nome" label={copy.labels.nome} autoComplete="name" />
          <TextField<TerrenoInput>
            name="email"
            label={copy.labels.email}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <TextField<TerrenoInput>
            name="telemovel"
            label={copy.labels.telemovel}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
          <TextField<TerrenoInput> name="localizacao" label={copy.labels.localizacao} />
          <TextField<TerrenoInput> name="area" label={copy.labels.area} inputMode="numeric" />
        </div>
        <TextAreaField<TerrenoInput> name="mensagem" label={copy.labels.mensagem} rows={6} />
        <FormStatus status={status} message={message} />
        <div>
          <Button type="submit" variant="primary" withArrow disabled={status === 'sending'}>
            {copy.cta}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

/** Opção 3 — futuro proprietário. */
export function ProprietarioForm() {
  const copy = forms.proprietario
  const form = useForm<ProprietarioInput>({
    resolver: zodResolver(proprietarioSchema),
    mode: 'onBlur',
    defaultValues: { website: '' },
  })
  const { status, message, submit, focusFirstError } = useSubmitForm('proprietario', form)

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(submit, focusFirstError)} className={shell}>
        <Honeypot<ProprietarioInput> />
        <div className={grid}>
          <TextField<ProprietarioInput> name="nome" label={copy.labels.nome} autoComplete="name" />
          <TextField<ProprietarioInput>
            name="email"
            label={copy.labels.email}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <TextField<ProprietarioInput>
            name="telemovel"
            label={copy.labels.telemovel}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
        <TextAreaField<ProprietarioInput> name="mensagem" label={copy.labels.mensagem} rows={5} />
        <FormStatus status={status} message={message} />
        <div>
          <Button type="submit" variant="primary" withArrow disabled={status === 'sending'}>
            {copy.cta}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

/** Formulário da página Contacto. */
export function ContactoForm() {
  const copy = forms.contacto
  const form = useForm<ContactoInput>({
    resolver: zodResolver(contactoSchema),
    mode: 'onBlur',
    defaultValues: { website: '' },
  })
  const { status, message, submit, focusFirstError } = useSubmitForm('contacto', form)

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(submit, focusFirstError)} className={shell}>
        <Honeypot<ContactoInput> />
        <div className={grid}>
          <TextField<ContactoInput> name="nome" label={copy.labels.nome} autoComplete="name" />
          <TextField<ContactoInput>
            name="email"
            label={copy.labels.email}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <TextField<ContactoInput>
            name="telemovel"
            label={copy.labels.telemovel}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
          <SelectField<ContactoInput>
            name="assunto"
            label={copy.labels.assunto}
            options={copy.assunto}
          />
        </div>
        <TextAreaField<ContactoInput> name="mensagem" label={copy.labels.mensagem} rows={6} />
        <FormStatus status={status} message={message} />
        <div>
          <Button type="submit" variant="primary" withArrow disabled={status === 'sending'}>
            {copy.cta}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
