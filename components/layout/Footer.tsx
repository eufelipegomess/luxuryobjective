import Image from 'next/image'
import Link from 'next/link'
import { brand } from '@/lib/media'
import { primaryNav, routes, siteConfig } from '@/lib/config'
import { contacto, footer, nav } from '@/content/pt-PT'

/**
 * Footer amplo e sóbrio. Sem repetir uma grande CTA — todas as páginas já
 * terminam com uma chamada própria.
 *
 * TODO (conteúdo real pendente): as rotas /privacidade e /cookies existem mas
 * aguardam texto jurídico aprovado pelo cliente. Não publicamos uma política
 * fictícia — as páginas declaram-se em preparação. Ver README.
 * TODO (conteúdo real pendente): os perfis sociais só ganham link quando o
 * cliente fornecer os URLs reais; até lá ficam como texto aprovado.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-ink">
      <div className="shell py-(--spacing-section-tight)">
        <div className="grid-editorial gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            {/* Símbolo, não o lockup: o rodapé já traz a morada e os
                contactos, e o nome por extenso repetia-se ali ao lado. */}
            <Link href={routes.home} aria-label={siteConfig.name}>
              <Image
                src={brand.iconPrimary}
                alt=""
                width={182}
                height={334}
                className="h-16 w-auto"
              />
            </Link>
          </div>

          <nav
            aria-label="Navegação do rodapé"
            // Em telemóvel a meia largura deixava a morada e os telefones a
            // partir em linhas de duas palavras. Cada bloco ocupa a largura toda.
            className="col-span-4 md:col-span-4 lg:col-span-3 lg:col-start-6"
          >
            <ul className="flex flex-col gap-3">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-nav text-bone-muted transition-colors hover:text-bone"
                  >
                    {nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-4 md:col-span-4 lg:col-span-4 lg:col-start-9">
            <address className="flex flex-col gap-3 not-italic text-sm leading-relaxed text-bone-muted">
              <span className="text-bone">{contacto.morada}</span>
              {contacto.telefones.map((phone) => (
                <a key={phone.href} href={phone.href} className="transition-colors hover:text-bone">
                  {phone.label}
                </a>
              ))}
              <a href={contacto.email.href} className="transition-colors hover:text-bone">
                {contacto.email.label}
              </a>
            </address>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-bone-muted">
              {contacto.redes.map((rede) => (
                <li key={rede.label}>
                  {/* `noopener` é o que impede a página aberta de mexer nesta
                      pelo `window.opener`. */}
                  <a
                    href={rede.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-bone"
                  >
                    {rede.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-(--spacing-section-tight) flex flex-col gap-4 border-t border-line pt-8 text-[0.8125rem] text-bone-muted md:flex-row md:items-center md:justify-between">
          <p>{footer.copyright(year)}</p>
          <ul className="flex flex-wrap gap-6">
            <li>
              <Link href={routes.privacidade} className="transition-colors hover:text-bone">
                {footer.privacidade}
              </Link>
            </li>
            <li>
              <Link href={routes.cookies} className="transition-colors hover:text-bone">
                {footer.cookies}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
