import { CartaoSolicitacao } from './CartaoSolicitacao'
import type { Departamento } from './departamentos'
import type { ItemFila } from './solicitacoes'

type FilaAtendimentoProps = {
  itens: ItemFila[]
  departamentos?: Departamento[]
  acaoEmAndamento?: boolean
  onAlterarPrioridade?: (solicitacaoId: number, prioridade: ItemFila['prioridade']) => void
  onConcluir?: (solicitacaoId: number) => void
}

export function FilaAtendimento({
  itens,
  departamentos = [],
  acaoEmAndamento = false,
  onAlterarPrioridade,
  onConcluir,
}: FilaAtendimentoProps) {
  if (!itens.length) {
    return <p role="status">Nenhuma solicitação ativa neste departamento.</p>
  }

  return (
    <ol className="lista-fila" aria-label="Ordem de atendimento" role="list">
      {itens.map((item, posicao) => {
        const solicitante = departamentos.find(({ id }) => id === item.departamentoSolicitanteId)

        return (
          <CartaoSolicitacao
            key={item.id}
            item={item}
            departamentoSolicitante={solicitante?.nome ?? `Departamento #${item.departamentoSolicitanteId}`}
            proxima={posicao === 0}
            acaoEmAndamento={acaoEmAndamento}
            onAlterarPrioridade={onAlterarPrioridade}
            onConcluir={onConcluir}
          />
        )
      })}
    </ol>
  )
}
