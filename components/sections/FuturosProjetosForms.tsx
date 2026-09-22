'use client'

import { useEffect, useState } from 'react'
import { Selector, SelectorPanel } from '@/components/forms/Selector'
import { ParceriaForm, ProprietarioForm, TerrenoForm } from '@/components/forms/SimpleForms'
import { SplitLines } from '@/components/motion/SplitLines'
import { futurosProjetos } from '@/content/pt-PT'
import { noWidow } from '@/lib/utils'

/**
 * Área de futuros projetos. Vive dentro da página Projetos e serve de destino
 * estável para os CTAs da Home (âncora #futuros-projetos).
 *
 * Um CTA pode chegar com a opção já escolhida (`?interesse=parceria`): é o caso
 * do "Apresentar uma oportunidade" da Home. Lê-se depois da hidratação — no
 * servidor não há URL do browser, e ler antes dava HTML diferente nos dois.
 */
export function FuturosProjetosForms() {
  const [choice, setChoice] = useState<string | null>(null)
  // Só um gesto do utilizador leva o formulário ao topo em mobile; quando a
  // escolha vem do URL, a página abre no título da secção.
  const [fromUrl, setFromUrl] = useState(false)

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('interesse')
    if (!futurosProjetos.options.some((option) => option.id === wanted)) return
    setFromUrl(true)
    setChoice(wanted)
  }, [])

  return (
    <section
      id="futuros-projetos"
      className="scroll-mt-28 border-t border-line bg-ink"
      aria-labelledby="futuros-projetos-titulo"
    >
      <div className="shell py-(--spacing-section)">
        <h2 id="futuros-projetos-titulo" className="text-headline max-w-[18ch] text-bone">
          <SplitLines text={futurosProjetos.title} />
        </h2>
        <p data-reveal data-delay="0.15" className="measure mt-8 text-bone-muted">
          {noWidow(futurosProjetos.body)}
        </p>

        <div className="mt-14 border border-line">
          <Selector
            options={futurosProjetos.options}
            value={choice}
            onChange={(id) => {
              setFromUrl(false)
              setChoice(id)
            }}
            label={futurosProjetos.title}
          />
        </div>

        {choice ? (
          <SelectorPanel choice={choice} autoScroll={!fromUrl}>
            {choice === 'parceria' ? <ParceriaForm /> : null}
            {choice === 'terreno' ? <TerrenoForm /> : null}
            {choice === 'proprietario' ? <ProprietarioForm /> : null}
          </SelectorPanel>
        ) : null}
      </div>
    </section>
  )
}
