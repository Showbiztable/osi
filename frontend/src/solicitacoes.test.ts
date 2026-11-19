import { afterEach, expect, it, vi } from 'vitest'
import { cadastrarSolicitacao, type DadosCadastro } from './solicitacoes'

afterEach(() => {
  vi.unstubAllGlobals()
})

it('envia os dados do cadastro e retorna o ID da solicitação criada', async () => {
  const dados: DadosCadastro = {
    descricao: 'Acesso ao sistema de notas fiscais',
    departamentoSolicitanteId: 10,
    departamentoResponsavelId: 20,
    prioridade: 'ALTA',
  }
  const idCriado = 42
  const fetchMock = vi.fn<typeof fetch>()
    .mockResolvedValue(Response.json({ id: idCriado }, { status: 201 }))
  vi.stubGlobal('fetch', fetchMock)

  const id = await cadastrarSolicitacao(dados)

  expect(id).toBe(idCriado)
  expect(fetchMock).toHaveBeenCalledWith('/api/solicitacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
})
