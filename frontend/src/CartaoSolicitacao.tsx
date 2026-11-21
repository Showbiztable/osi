import { rotulosPrioridade, type ItemFila } from './solicitacoes'
import './CartaoSolicitacao.css'

type CartaoSolicitacaoProps = {
  item: ItemFila
  departamentoSolicitante: string
  departamentoResponsavel: string
  proxima: boolean
  acaoEmAndamento: boolean
  onAlterarPrioridade?: (solicitacaoId: number, prioridade: ItemFila['prioridade']) => void
  onConcluir?: (solicitacaoId: number) => void
}

const formatoEntrada = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function CartaoSolicitacao({
  item,
  departamentoSolicitante,
  departamentoResponsavel,
  proxima,
  acaoEmAndamento,
  onAlterarPrioridade,
  onConcluir,
}: CartaoSolicitacaoProps) {
  return (
    <li className={proxima ? 'item-fila proxima-da-fila' : 'item-fila'}>
      <div className="item-fila-cabecalho">
        {proxima && <span className="proxima-etiqueta">Próxima solicitação</span>}
        <span className="prioridade" data-prioridade={item.prioridade}>
          {rotulosPrioridade[item.prioridade]}
        </span>
      </div>
      <h3>{item.descricao}</h3>
      <p className="metadados-fila">
        <span>#{item.id}</span>
        <span>De {departamentoSolicitante}</span>
        <span>Para {departamentoResponsavel}</span>
        <time dateTime={item.entrada}>{formatoEntrada.format(new Date(item.entrada))}</time>
      </p>
      <div className="item-fila-acoes">
        <label className="campo">
          Alterar prioridade
          <select
            aria-label={`Alterar prioridade da solicitação #${item.id}`}
            value={item.prioridade}
            disabled={acaoEmAndamento || !onAlterarPrioridade}
            onChange={(evento) => onAlterarPrioridade?.(item.id, evento.currentTarget.value as ItemFila['prioridade'])}
          >
            {Object.entries(rotulosPrioridade).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-label={`Concluir solicitação #${item.id}`}
          disabled={acaoEmAndamento || !onConcluir}
          onClick={() => onConcluir?.(item.id)}
        >
          Concluir
        </button>
      </div>
    </li>
  )
}
