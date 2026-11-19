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
  prioridade: DadosCadastro['prioridade']
  entrada: string
}

export async function listarFila(departamentoResponsavelId: number): Promise<ItemFila[]> {
  const resposta = await fetch(`/api/solicitacoes?departamentoResponsavelId=${departamentoResponsavelId}`)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar a fila do departamento.')
  }

  return resposta.json()
}

export async function cadastrarSolicitacao(dados: DadosCadastro): Promise<number> {
  const resposta = await fetch('/api/solicitacoes', {
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
  const resposta = await fetch(`/api/solicitacoes/${solicitacaoId}/prioridade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prioridade }),
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível alterar a prioridade da solicitação.')
  }
}
