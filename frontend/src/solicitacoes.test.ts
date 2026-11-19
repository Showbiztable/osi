import { afterEach, expect, it, vi } from 'vitest'
import { cadastrarSolicitacao, listarFila, type DadosCadastro, type ItemFila } from './solicitacoes'

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

it('consulta a fila do departamento responsável na ordem devolvida pela API', async () => {
  const departamentoResponsavelId = 20
  const fila: ItemFila[] = [
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
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json(fila))
  vi.stubGlobal('fetch', fetchMock)

  const resultado = await listarFila(departamentoResponsavelId)

  expect(resultado).toEqual(fila)
  expect(fetchMock).toHaveBeenCalledWith('/api/solicitacoes?departamentoResponsavelId=20')
})
