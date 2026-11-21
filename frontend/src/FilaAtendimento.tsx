import { CartaoSolicitacao } from './CartaoSolicitacao'
import type { Departamento } from './departamentos'
import type { ItemFila } from './solicitacoes'

type FilaAtendimentoProps = {
  itens: ItemFila[]
  departamentos?: Departamento[]
  departamentosResponsaveisSelecionados?: number[]
  acaoEmAndamento?: boolean
  onAlterarPrioridade?: (solicitacaoId: number, prioridade: ItemFila['prioridade']) => void
  onConcluir?: (solicitacaoId: number) => void
}

export function FilaAtendimento({
  itens,
  departamentos = [],
  departamentosResponsaveisSelecionados = [],
  acaoEmAndamento = false,
  onAlterarPrioridade,
  onConcluir,
}: FilaAtendimentoProps) {
  const itensVisiveis = departamentosResponsaveisSelecionados.length
    ? itens.filter((item) => departamentosResponsaveisSelecionados.includes(item.departamentoResponsavelId))
    : itens

  if (!itensVisiveis.length) {
    return <p role="status">Nenhuma solicitação ativa.</p>
  }

  const departamentosJaExibidos = new Set<number>()
  const nomesDepartamentos = new Map(departamentos.map(({ id, nome }) => [id, nome]))
  const nomeDepartamento = (id: number) => nomesDepartamentos.get(id) ?? `Departamento #${id}`

  return (
    <ol className="lista-fila" aria-label="Ordem de atendimento" role="list">
      {itensVisiveis.map((item) => {
        const proxima = !departamentosJaExibidos.has(item.departamentoResponsavelId)
        departamentosJaExibidos.add(item.departamentoResponsavelId)

        return (
          <CartaoSolicitacao
            key={item.id}
            item={item}
            departamentoSolicitante={nomeDepartamento(item.departamentoSolicitanteId)}
            departamentoResponsavel={nomeDepartamento(item.departamentoResponsavelId)}
            proxima={proxima}
            acaoEmAndamento={acaoEmAndamento}
            onAlterarPrioridade={onAlterarPrioridade}
            onConcluir={onConcluir}
          />
        )
      })}
    </ol>
  )
}
