export type DadosCadastro = {
  descricao: string
  departamentoSolicitanteId: number
  departamentoResponsavelId: number
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
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
