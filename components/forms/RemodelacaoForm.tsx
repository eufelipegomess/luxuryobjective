'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField, Honeypot } from './Fields'
import { FileUpload } from './FileUpload'
import { FormStatus } from './FormStatus'
import { useSubmitForm } from './useSubmitForm'
import { remodelacaoSchema, type RemodelacaoInput } from '@/lib/validations/forms'
import { forms } from '@/content/pt-PT'

const copy = forms.remodelacao

export function RemodelacaoForm() {
  const form = useForm<RemodelacaoInput>({
    resolver: zodResolver(remodelacaoSchema),
    mode: 'onBlur',
    defaultValues: { ficheiros: [], website: '' },
  })
  const { status, message, submit, focusFirstError } = useSubmitForm('remodelacao', form)

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(submit, focusFirstError)}
        className="relative flex flex-col gap-8"
      >
        <h3 className="text-title text-bone">{copy.title}</h3>

        <Honeypot<RemodelacaoInput> />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TextField<RemodelacaoInput> name="nome" label={copy.labels.nome} autoComplete="name" />
          <TextField<RemodelacaoInput>
            name="email"
            label={copy.labels.email}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <TextField<RemodelacaoInput>
            name="telemovel"
            label={copy.labels.telemovel}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
          <TextField<RemodelacaoInput> name="localizacao" label={copy.labels.localizacao} />
          <SelectField<RemodelacaoInput>
            name="tipoImovel"
            label={copy.labels.tipoImovel}
            options={copy.tipoImovel}
          />
          <TextField<RemodelacaoInput> name="area" label={copy.labels.area} inputMode="numeric" />
          <SelectField<RemodelacaoInput>
            name="tipoIntervencao"
            label={copy.labels.tipoIntervencao}
            options={copy.tipoIntervencao}
          />
          <SelectField<RemodelacaoInput>
            name="orcamento"
            label={copy.labels.orcamento}
            options={copy.orcamento}
          />
          <TextField<RemodelacaoInput> name="prazo" label={copy.labels.prazo} />
        </div>

        <TextAreaField<RemodelacaoInput> name="descricao" label={copy.labels.descricao} rows={6} />
        <FileUpload<RemodelacaoInput> name="ficheiros" label={copy.labels.ficheiros} />

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
