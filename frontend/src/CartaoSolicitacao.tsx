import { rotulosPrioridade, type ItemFila } from './solicitacoes'
import './CartaoSolicitacao.css'

type CartaoSolicitacaoProps = {
  item: ItemFila
  departamentoSolicitante: string
  departamentoResponsavel: string
  concluida?: boolean
  proxima?: boolean
  acaoEmAndamento?: boolean
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
  concluida = false,
  proxima = false,
  acaoEmAndamento = false,
  onAlterarPrioridade,
  onConcluir,
}: CartaoSolicitacaoProps) {
  return (
    <li className={proxima ? 'item-fila proxima-da-fila' : 'item-fila'}>
      <div className="item-fila-cabecalho">
        {proxima && (
          <span className="proxima-etiqueta">Próxima solicitação da fila de {departamentoResponsavel}</span>
        )}
        <span className="prioridade" data-prioridade={item.prioridade}>
          {rotulosPrioridade[item.prioridade]}
        </span>
      </div>
      <h3>{item.descricao}</h3>
      <dl className="departamentos-cartao">
        <div>
          <dt>De</dt>
          <dd>{departamentoSolicitante}</dd>
        </div>
        <div className="responsavel-cartao">
          <dt>Para</dt>
          <dd>{departamentoResponsavel}</dd>
        </div>
      </dl>
      <p className="metadados-fila">
        <span>#{item.id}</span>
        <time dateTime={item.entrada}>{formatoEntrada.format(new Date(item.entrada))}</time>
      </p>
      {!concluida && (
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
      )}
    </li>
  )
}
