import type { Departamento } from './departamentos'
import { rotulosPrioridade, type ItemFila } from './solicitacoes'

type FilaAtendimentoProps = {
  itens: ItemFila[]
  departamentos?: Departamento[]
}

const formatoEntrada = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function FilaAtendimento({ itens, departamentos = [] }: FilaAtendimentoProps) {
  if (!itens.length) {
    return <p role="status">Nenhuma solicitação ativa neste departamento.</p>
  }

  return (
    <ol className="lista-fila" aria-label="Ordem de atendimento" role="list">
      {itens.map((item, posicao) => {
        const proxima = posicao === 0
        const solicitante = departamentos.find(({ id }) => id === item.departamentoSolicitanteId)

        return (
          <li className={proxima ? 'item-fila proxima-da-fila' : 'item-fila'} key={item.id}>
            <div className="item-fila-cabecalho">
              {proxima && <span className="proxima-etiqueta">Próxima solicitação</span>}
              <span className="prioridade" data-prioridade={item.prioridade}>
                {rotulosPrioridade[item.prioridade]}
              </span>
            </div>
            <h3>{item.descricao}</h3>
            <p className="metadados-fila">
              <span>#{item.id}</span>
              <span>De {solicitante?.nome ?? `Departamento #${item.departamentoSolicitanteId}`}</span>
              <time dateTime={item.entrada}>{formatoEntrada.format(new Date(item.entrada))}</time>
            </p>
          </li>
        )
      })}
    </ol>
  )
}
