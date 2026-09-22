'use client'

import { useState } from 'react'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField, Honeypot } from './Fields'
import { FileUpload } from './FileUpload'
import { FormStatus } from './FormStatus'
import { useSubmitForm } from './useSubmitForm'
import {
  oportunidadeSchema,
  oportunidadeStep1Schema,
  type OportunidadeInput,
} from '@/lib/validations/forms'
import { forms, servicos, ui } from '@/content/pt-PT'
import type { SubmissionFile } from '@/lib/types'

const copy = forms.oportunidade

/**
 * Todos os campos possíveis num único objeto. É isto que permite ao React Hook
 * Form preservar o que já foi escrito quando o utilizador volta ao Passo 1 e
 * muda de objetivo — nada se perde entre passos.
 */
type Values = {
  nome: string
  email: string
  telemovel: string
  perfil: string
  objetivo: string
  website: string
  localizacao: string
  tipoProjeto: string
  fase: string
  area: string
  valor: string
  objetivoProjeto: string
  descricao: string
  areaAtividade: string
  tipoParceria: string
  experiencia: string
  portefolio: string
  tipoInvestimento: string
  faixa: string
  zona: string
  objetivoInvestimento: string
  mensagem: string
  tipoObra: string
  estado: string
  prazo: string
  nomeEmpreendimento: string
  tipologia: string
  unidades: string
  estadoComercial: string
  necessidades: string
  analisar: string
  informacao: string
  ficheiros: SubmissionFile[]
}

const EMPTY: Values = {
  nome: '',
  email: '',
  telemovel: '',
  perfil: '',
  objetivo: '',
  website: '',
  localizacao: '',
  tipoProjeto: '',
  fase: '',
  area: '',
  valor: '',
  objetivoProjeto: '',
  descricao: '',
  areaAtividade: '',
  tipoParceria: '',
  experiencia: '',
  portefolio: '',
  tipoInvestimento: '',
  faixa: '',
  zona: '',
  objetivoInvestimento: '',
  mensagem: '',
  tipoObra: '',
  estado: '',
  prazo: '',
  nomeEmpreendimento: '',
  tipologia: '',
  unidades: '',
  estadoComercial: '',
  necessidades: '',
  analisar: '',
  informacao: '',
  ficheiros: [],
}

/** Só os campos do objetivo escolhido seguem para validação e para o servidor. */
const FIELDS_BY_OBJETIVO: Record<string, (keyof Values)[]> = {
  'Desenvolvimento do projeto': [
    'localizacao',
    'tipoProjeto',
    'fase',
    'area',
    'valor',
    'objetivoProjeto',
    'descricao',
    'ficheiros',
  ],
  'Parceria estratégica': [
    'areaAtividade',
    'tipoParceria',
    'experiencia',
    'portefolio',
    'descricao',
  ],
  Investimento: ['tipoInvestimento', 'faixa', 'zona', 'objetivoInvestimento', 'mensagem'],
  'Gestão e execução da obra': [
    'localizacao',
    'tipoObra',
    'estado',
    'prazo',
    'valor',
    'descricao',
  ],
  'Comercialização do empreendimento': [
    'nomeEmpreendimento',
    'localizacao',
    'tipologia',
    'unidades',
    'estadoComercial',
    'necessidades',
    'ficheiros',
  ],
  'Análise de viabilidade / oportunidade': ['localizacao', 'analisar', 'informacao', 'ficheiros'],
  Outro: ['descricao'],
}

export function OportunidadeForm() {
  const [step, setStep] = useState<1 | 2>(1)
  const form = useForm<Values>({ defaultValues: EMPTY, mode: 'onBlur' })
  const objetivo = form.watch('objetivo')

  const { status, message, submit, focusFirstError } = useSubmitForm(
    'oportunidade',
    form as unknown as UseFormReturn<OportunidadeInput>,
  )

  const goToStep2 = async () => {
    form.clearErrors()
    const result = oportunidadeStep1Schema.safeParse(form.getValues())
    if (!result.success) {
      applyZodErrors(form, result.error)
      focusFirstError()
      return
    }
    setStep(2)
  }

  const onSubmit = async () => {
    form.clearErrors()
    const values = form.getValues()
    const scoped: Record<string, unknown> = {
      nome: values.nome,
      email: values.email,
      telemovel: values.telemovel,
      perfil: values.perfil,
      objetivo: values.objetivo,
      website: values.website,
    }
    for (const field of FIELDS_BY_OBJETIVO[values.objetivo] ?? []) {
      scoped[field] = values[field]
    }

    const result = oportunidadeSchema.safeParse(scoped)
    if (!result.success) {
      applyZodErrors(form, result.error)
      focusFirstError()
      return
    }

    await submit(result.data as OportunidadeInput)
  }

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void onSubmit()
        }}
        className="relative flex flex-col gap-8"
      >
        <div className="flex items-baseline justify-between gap-6">
          <h3 className="text-title text-bone">{copy.title}</h3>
          <p className="shrink-0 text-eyebrow text-bone-muted">
            {ui.passo} {step} {ui.de} 2
          </p>
        </div>

        <Honeypot<Values> />

        {step === 1 ? (
          <>
            <h4 className="text-eyebrow text-gold">{copy.step1Title}</h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <TextField<Values> name="nome" label={copy.labels.nome} autoComplete="name" />
              <TextField<Values>
                name="email"
                label={copy.labels.email}
                type="email"
                inputMode="email"
                autoComplete="email"
              />
              <TextField<Values>
                name="telemovel"
                label={copy.labels.telemovel}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
              />
              <SelectField<Values>
                name="perfil"
                label={copy.labels.perfil}
                options={copy.perfil}
              />
              <SelectField<Values>
                name="objetivo"
                label={copy.labels.objetivo}
                options={copy.objetivo}
                className="md:col-span-2"
              />
            </div>

            <div>
              <Button type="button" variant="primary" withArrow onClick={() => void goToStep2()}>
                {ui.seguinte}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h4 className="text-eyebrow text-gold">{copy.step2Title}</h4>
            <Step2Fields objetivo={objetivo} />

            <FormStatus status={status} message={message} />

            <div className="flex flex-wrap items-center gap-4">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                {ui.anterior}
              </Button>
              <Button type="submit" variant="primary" withArrow disabled={status === 'sending'}>
                {copy.cta}
              </Button>
            </div>
          </>
        )}

        <p className="measure border-t border-line pt-6 text-sm text-bone-muted">{servicos.nota}</p>
      </form>
    </FormProvider>
  )
}

function Step2Fields({ objetivo }: { objetivo: string }) {
  switch (objetivo) {
    case 'Desenvolvimento do projeto': {
      const c = copy.desenvolvimento
      return (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField<Values> name="localizacao" label={c.labels.localizacao} />
            <SelectField<Values>
              name="tipoProjeto"
              label={c.labels.tipoProjeto}
              options={c.tipoProjeto}
            />
            <SelectField<Values> name="fase" label={c.labels.fase} options={c.fase} />
            <TextField<Values> name="area" label={c.labels.area} />
            <TextField<Values> name="valor" label={c.labels.valor} />
          </div>
          <TextAreaField<Values> name="objetivoProjeto" label={c.labels.objetivoProjeto} rows={4} />
          <TextAreaField<Values> name="descricao" label={c.labels.descricao} rows={6} />
          <FileUpload<Values> name="ficheiros" label={c.labels.ficheiros} />
        </>
      )
    }

    case 'Parceria estratégica': {
      const c = copy.parceria
      return (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SelectField<Values>
              name="areaAtividade"
              label={c.labels.areaAtividade}
              options={c.areaAtividade}
            />
            <TextField<Values> name="tipoParceria" label={c.labels.tipoParceria} />
            <TextField<Values> name="experiencia" label={c.labels.experiencia} />
            <TextField<Values> name="portefolio" label={c.labels.portefolio} />
          </div>
          <TextAreaField<Values> name="descricao" label={c.labels.descricao} rows={6} />
        </>
      )
    }

    case 'Investimento': {
      const c = copy.investimento
      return (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SelectField<Values>
              name="tipoInvestimento"
              label={c.labels.tipoInvestimento}
              options={c.tipoInvestimento}
            />
            <SelectField<Values> name="faixa" label={c.labels.faixa} options={c.faixa} />
            <TextField<Values> name="zona" label={c.labels.zona} />
          </div>
          <TextAreaField<Values>
            name="objetivoInvestimento"
            label={c.labels.objetivoInvestimento}
            rows={4}
          />
          <TextAreaField<Values> name="mensagem" label={c.labels.mensagem} rows={5} />
        </>
      )
    }

    case 'Gestão e execução da obra': {
      const c = copy.gestao
      return (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField<Values> name="localizacao" label={c.labels.localizacao} />
            <TextField<Values> name="tipoObra" label={c.labels.tipoObra} />
            <SelectField<Values> name="estado" label={c.labels.estado} options={c.estado} />
            <TextField<Values> name="prazo" label={c.labels.prazo} />
            <TextField<Values> name="valor" label={c.labels.valor} />
          </div>
          <TextAreaField<Values> name="descricao" label={c.labels.descricao} rows={6} />
        </>
      )
    }

    case 'Comercialização do empreendimento': {
      const c = copy.comercializacao
      return (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField<Values>
              name="nomeEmpreendimento"
              label={c.labels.nomeEmpreendimento}
            />
            <TextField<Values> name="localizacao" label={c.labels.localizacao} />
            <TextField<Values> name="tipologia" label={c.labels.tipologia} />
            <TextField<Values> name="unidades" label={c.labels.unidades} inputMode="numeric" />
            <SelectField<Values>
              name="estadoComercial"
              label={c.labels.estadoComercial}
              options={c.estadoComercial}
            />
          </div>
          <TextAreaField<Values> name="necessidades" label={c.labels.necessidades} rows={5} />
          <FileUpload<Values> name="ficheiros" label={c.labels.ficheiros} />
        </>
      )
    }

    case 'Análise de viabilidade / oportunidade': {
      const c = copy.viabilidade
      return (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField<Values> name="localizacao" label={c.labels.localizacao} />
            <SelectField<Values> name="analisar" label={c.labels.analisar} options={c.analisar} />
          </div>
          <TextAreaField<Values> name="informacao" label={c.labels.informacao} rows={5} />
          <FileUpload<Values> name="ficheiros" label={c.labels.ficheiros} />
        </>
      )
    }

    default:
      return (
        <TextAreaField<Values> name="descricao" label={copy.outro.labels.descricao} rows={6} />
      )
  }
}

/** Reprojeta os erros do Zod nos campos do React Hook Form. */
function applyZodErrors(form: UseFormReturn<Values>, error: z.ZodError): void {
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string') {
      form.setError(field as keyof Values, { type: 'validate', message: issue.message })
    }
  }
}
