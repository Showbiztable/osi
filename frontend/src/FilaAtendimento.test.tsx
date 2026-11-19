import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { FilaAtendimento } from './FilaAtendimento'
import type { ItemFila } from './solicitacoes'

it('destaca apenas a primeira solicitação na ordem recebida', () => {
  const itens: ItemFila[] = [
    {
      id: 42,
      descricao: 'Restaurar o acesso',
      departamentoSolicitanteId: 10,
      prioridade: 'URGENTE',
      entrada: '2026-11-19T12:15:00Z',
    },
    {
      id: 41,
      descricao: 'Atualizar o cadastro',
      departamentoSolicitanteId: 10,
      prioridade: 'BAIXA',
      entrada: '2026-11-19T12:00:00Z',
    },
  ]

  const pagina = renderToStaticMarkup(<FilaAtendimento itens={itens} />)
  const itensExibidos = pagina.match(/<li\b[^>]*>[\s\S]*?<\/li>/g) ?? []

  expect(itensExibidos).toHaveLength(2)
  expect(itensExibidos[0]).toContain('Restaurar o acesso')
  expect(itensExibidos[0]).toContain('Próxima solicitação')
  expect(itensExibidos[1]).toContain('Atualizar o cadastro')
  expect(itensExibidos[1]).not.toContain('Próxima solicitação')
})
