import { describe, expect, it } from 'vitest'
import { emailDeSubmissao } from '@/lib/server/notify'

describe('emailDeSubmissao', () => {
  const contacto = emailDeSubmissao(
    'contacto',
    {
      nome: 'Ana Ribeiro',
      email: 'ana@exemplo.pt',
      telemovel: '+351 912 000 000',
      assunto: 'Orçamento',
      mensagem: 'Bom dia.',
    },
    [],
  )

  it('vai para a caixa da equipa', () => {
    expect(contacto.to).toEqual(['equipaaluxury@gmail.com'])
  })

  it('responde a quem preencheu', () => {
    expect(contacto.reply_to).toBe('ana@exemplo.pt')
  })

  it('leva o nome no assunto', () => {
    expect(contacto.subject).toContain('Ana Ribeiro')
  })

  it('usa as etiquetas que o visitante viu, não os nomes dos campos', () => {
    expect(contacto.text).toContain('Telemóvel: +351 912 000 000')
    expect(contacto.text).not.toContain('telemovel:')
  })

  it('encontra as etiquetas dos percursos do formulário de oportunidade', () => {
    const email = emailDeSubmissao(
      'oportunidade',
      { nome: 'Rui', email: 'rui@exemplo.pt', perfil: 'Investidor', fase: 'Terreno sem projeto' },
      [],
    )
    expect(email.text).toContain('Fase do projeto: Terreno sem projeto')
  })

  it('lista os ficheiros em vez de os anexar', () => {
    const email = emailDeSubmissao(
      'remodelacao',
      { nome: 'Ana', email: 'ana@exemplo.pt' },
      [{ path: 'x/planta.pdf', name: 'planta.pdf', size: 2_097_152, type: 'application/pdf' }],
    )
    expect(email.text).toContain('planta.pdf (2.0 MB)')
    expect(email.text).toContain('/admin')
  })

  it('ignora campos vazios', () => {
    const email = emailDeSubmissao('proprietario', { nome: 'Ana', mensagem: '' }, [])
    expect(email.text).not.toContain('Mensagem')
  })
})
