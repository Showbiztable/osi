import { requisitarComSessao } from '../acesso/acesso'

export const rotulosPrioridade = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
} as const

export type DadosCadastro = {
  descricao: string
  departamentoSolicitanteId: number
  departamentoResponsavelId: number
  prioridade: keyof typeof rotulosPrioridade
}

export type ItemFila = {
  id: number
  descricao: string
  departamentoSolicitanteId: number
  departamentoResponsavelId: number
  prioridade: DadosCadastro['prioridade']
  entrada: string
}

export async function listarFila(departamentoResponsavelId?: number): Promise<ItemFila[]> {
  const recurso = '/api/solicitacoes'
  const endereco = departamentoResponsavelId === undefined
    ? recurso
    : `${recurso}?departamentoResponsavelId=${departamentoResponsavelId}`
  const resposta = await requisitarComSessao(endereco)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar a fila.')
  }

  return resposta.json()
}

export async function listarConcluidas(): Promise<ItemFila[]> {
  const resposta = await requisitarComSessao('/api/solicitacoes/concluidas')
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar as solicitações concluídas.')
  }

  return resposta.json()
}

export async function cadastrarSolicitacao(dados: DadosCadastro): Promise<number> {
  const resposta = await requisitarComSessao('/api/solicitacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível cadastrar a solicitação.')
  }

  const solicitacao: { id: number } = await resposta.json()
  return solicitacao.id
}

export async function alterarPrioridade(
  solicitacaoId: number,
  prioridade: DadosCadastro['prioridade'],
): Promise<void> {
  const resposta = await requisitarComSessao(`/api/solicitacoes/${solicitacaoId}/prioridade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prioridade }),
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível alterar a prioridade da solicitação.')
  }
}

export async function concluirSolicitacao(solicitacaoId: number): Promise<void> {
  const resposta = await requisitarComSessao(`/api/solicitacoes/${solicitacaoId}/conclusao`, { method: 'PATCH' })

  if (!resposta.ok) {
    throw new Error('Não foi possível concluir a solicitação.')
  }
}

export async function reabrirSolicitacao(solicitacaoId: number): Promise<void> {
  const resposta = await requisitarComSessao(`/api/solicitacoes/${solicitacaoId}/reabertura`, { method: 'PATCH' })

  if (!resposta.ok) {
    throw new Error('Não foi possível reabrir a solicitação.')
  }
}

export async function alterarDescricao(solicitacaoId: number, descricao: string): Promise<void> {
  const resposta = await requisitarComSessao(`/api/solicitacoes/${solicitacaoId}/descricao`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descricao }),
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível alterar a descrição da solicitação.')
  }
}
