import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContactoForm } from '@/components/forms/SimpleForms'
import { MapEmbed } from '@/components/sections/MapEmbed'
import { contacto, nav } from '@/content/pt-PT'
import { truncate } from '@/lib/utils'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: nav.contacto,
  description: truncate(contacto.body, 155),
  alternates: { canonical: '/contacto' },
  openGraph: {
    images: [siteConfig.ogImage],
    title: `${nav.contacto} — Luxury Objective`,
    description: truncate(contacto.body, 155),
    url: '/contacto',
  },
}

/**
 * Contacto: dados de um lado, formulário do outro.
 *
 * A coluna esquerda é uma grelha fechada — quatro células de dados e o mapa a
 * ocupar o resto da altura. É isso que faz as duas colunas acabarem à mesma
 * altura, sem o vazio que sobrava por baixo dos contactos.
 */
export default function ContactoPage() {
  const cells = [
    {
      label: contacto.moradaLabel,
      content: <p className="text-bone">{contacto.morada}</p>,
    },
    {
      label: contacto.emailLabel,
      content: (
        <a href={contacto.email.href} className="text-bone transition-colors hover:text-gold">
          {contacto.email.label}
        </a>
      ),
    },
    {
      label: contacto.contactosLabel,
      content: (
        <ul className="flex flex-col gap-1.5">
          {contacto.telefones.map((phone) => (
            <li key={phone.href}>
              <a href={phone.href} className="text-bone transition-colors hover:text-gold">
                {phone.label}
              </a>
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: contacto.redesLabel,
      content: (
        <ul className="flex flex-col gap-1.5 text-bone">
          {contacto.redes.map((rede) => (
            <li key={rede.label}>
              <a
                href={rede.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 transition-colors hover:underline"
              >
                {rede.label}
              </a>
            </li>
          ))}
        </ul>
      ),
    },
  ]

  return (
    <>
      <PageHeader title={contacto.title} body={contacto.body} />

      <section className="shell pb-(--spacing-section) pt-(--spacing-section-tight)">
        <div className="grid-editorial gap-y-10">
          <div className="col-span-4 flex flex-col md:col-span-8 lg:col-span-5">
            <address className="grid grid-cols-1 gap-px border border-line bg-line not-italic sm:grid-cols-2">
              {cells.map((cell) => (
                <div key={cell.label} className="bg-ink p-6">
                  <h2 className="text-eyebrow text-bone-muted">{cell.label}</h2>
                  <div className="mt-3 text-base md:text-[0.9375rem] leading-relaxed">{cell.content}</div>
                </div>
              ))}
            </address>

            {/* `flex-1` faz o mapa esticar até à altura do formulário. */}
            <div className="mt-6 min-h-[280px] flex-1 border border-line lg:mt-8">
              <MapEmbed />
            </div>
          </div>

          <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            <h2 className="text-eyebrow text-bone-muted">{contacto.form.title}</h2>
            <div className="mt-8">
              <ContactoForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
