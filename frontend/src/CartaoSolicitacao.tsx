import { useId, useRef, type DragEvent } from 'react'
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
  onReabrir?: (solicitacaoId: number) => void
  onArrastar?: (evento: DragEvent<HTMLLIElement>) => void
  onTerminarArraste?: () => void
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
  onReabrir,
  onArrastar,
  onTerminarArraste,
}: CartaoSolicitacaoProps) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const dialogoId = useId()

  return (
    <li
      className={proxima ? 'item-fila proxima-da-fila' : 'item-fila'}
      draggable={onArrastar ? true : undefined}
      onDragStart={onArrastar}
      onDragEnd={onTerminarArraste}
    >
      <div className="item-fila-cabecalho">
        <span className="numero-cartao">#{item.id}</span>
        <span className="prioridade" data-prioridade={item.prioridade}>
          {rotulosPrioridade[item.prioridade]}
        </span>
      </div>
      {proxima && (
        <span className="proxima-etiqueta">Próxima solicitação da fila de {departamentoResponsavel}</span>
      )}
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
      <time className="entrada-cartao" dateTime={item.entrada}>Aberto em {formatoEntrada.format(new Date(item.entrada))}</time>
      <div className="item-fila-acoes">
        {!concluida && (
          <label className="campo prioridade-cartao-campo">
            <span>Prioridade</span>
            <select
              className="prioridade-cartao-seletor"
              aria-label={`Alterar prioridade da solicitação #${item.id}`}
              value={item.prioridade}
              disabled={acaoEmAndamento || !onAlterarPrioridade}
              onChange={(evento) => onAlterarPrioridade?.(item.id, evento.currentTarget.value as ItemFila['prioridade'])}
            >
              {Object.entries(rotulosPrioridade).map(([valor, rotulo]) => (
                <option key={valor} value={valor} data-prioridade={valor}>{rotulo}</option>
              ))}
            </select>
          </label>
        )}
        <div className="item-fila-botoes">
          <button
            type="button"
            className="botao-secundario"
            aria-haspopup="dialog"
            aria-controls={dialogoId}
            onClick={() => dialogo.current?.showModal()}
          >
            Ver descrição completa
          </button>
          {concluida ? onReabrir && (
            <button
              type="button"
              className="botao-secundario"
              aria-label={`Reabrir solicitação #${item.id}`}
              disabled={acaoEmAndamento}
              onClick={() => onReabrir(item.id)}
            >
              Reabrir
            </button>
          ) : (
            <button
              type="button"
              aria-label={`Concluir solicitação #${item.id}`}
              disabled={acaoEmAndamento || !onConcluir}
              onClick={() => onConcluir?.(item.id)}
            >
              Concluir
            </button>
          )}
        </div>
      </div>
      <dialog ref={dialogo} id={dialogoId} className="descricao-completa" aria-labelledby={`${dialogoId}-titulo`}>
        <h4 id={`${dialogoId}-titulo`}>Descrição da solicitação #{item.id}</h4>
        <p>{item.descricao}</p>
        <form method="dialog">
          <button type="submit">Fechar</button>
        </form>
      </dialog>
    </li>
  )
}
