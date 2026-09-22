'use client'

import { useState } from 'react'
import { Selector, SelectorPanel } from '@/components/forms/Selector'
import { RemodelacaoForm } from '@/components/forms/RemodelacaoForm'
import { OportunidadeForm } from '@/components/forms/OportunidadeForm'
import { servicos } from '@/content/pt-PT'
import { noWidow } from '@/lib/utils'

/**
 * Orçamentos & Oportunidades: primeiro os dois seletores, e só depois o
 * formulário correspondente. Nunca os dois formulários ao mesmo tempo.
 */
export function OrcamentosOportunidades() {
  const [choice, setChoice] = useState<string | null>(null)
  const { orcamentos } = servicos

  return (
    <section id="orcamentos" className="scroll-mt-28 bg-ink" aria-labelledby="orcamentos-titulo">
      <div className="shell py-(--spacing-section)">
        <h2 id="orcamentos-titulo" className="text-headline text-bone">
          {orcamentos.title}
        </h2>
        <p data-reveal className="measure mt-8 text-bone-muted">
          {noWidow(orcamentos.body)}
        </p>

        <div className="mt-14 border border-line">
          <Selector
            options={orcamentos.selectors}
            value={choice}
            onChange={setChoice}
            label={orcamentos.title}
          />
        </div>

        {choice ? (
          <SelectorPanel choice={choice}>
            {choice === 'remodelacao' ? <RemodelacaoForm /> : <OportunidadeForm />}
          </SelectorPanel>
        ) : null}
      </div>
    </section>
  )
}
