import { contacto } from '@/content/pt-PT'

/**
 * Página legal ainda sem texto aprovado.
 *
 * Deliberadamente mínima: a rota tem de existir para os links do rodapé
 * funcionarem, mas publicar uma política inventada seria pior do que não ter
 * nenhuma. Substituir pelo texto do cliente quando chegar.
 */
export function LegalPending({ title }: { title: string }) {
  return (
    <section className="shell pb-(--spacing-section) pt-[clamp(8rem,18vh,12rem)]">
      <h1 className="text-headline max-w-[18ch] text-bone">{title}</h1>
      <p className="measure mt-10 text-bone-muted">
        Documento em preparação. Para qualquer questão sobre dados pessoais,
        contacte{' '}
        <a href={contacto.email.href} className="text-bone underline underline-offset-4">
          {contacto.email.label}
        </a>
        .
      </p>
    </section>
  )
}
