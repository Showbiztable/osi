import { useState, type DragEvent } from 'react'
import { CartaoSolicitacao } from './CartaoSolicitacao'
import type { Departamento } from '../departamentos/departamentos'
import type { ItemFila } from './solicitacoes'

type FilaAtendimentoProps = {
  itens: ItemFila[]
  concluidas?: ItemFila[]
  departamentos?: Departamento[]
  departamentosResponsaveisSelecionados?: number[]
  acaoEmAndamento?: boolean
  estadoFila?: 'carregando' | 'erro' | 'pronta'
  onAlterarPrioridade?: (solicitacaoId: number, prioridade: ItemFila['prioridade']) => void
  onAlterarDescricao?: (solicitacaoId: number, descricao: string) => Promise<void>
  onConcluir?: (solicitacaoId: number) => void
  onReabrir?: (solicitacaoId: number) => void
}

const tiposArraste = {
  ativa: 'application/x-osi-solicitacao-ativa',
  concluida: 'application/x-osi-solicitacao-concluida',
}

type OrigemArraste = keyof typeof tiposArraste

export function FilaAtendimento({
  itens,
  concluidas = [],
  departamentos = [],
  departamentosResponsaveisSelecionados = [],
  acaoEmAndamento = false,
  estadoFila = 'pronta',
  onAlterarPrioridade,
  onAlterarDescricao,
  onConcluir,
  onReabrir,
}: FilaAtendimentoProps) {
  const [origemArraste, setOrigemArraste] = useState<OrigemArraste | null>(null)
  const filtrarPorDepartamento = (lista: ItemFila[]) => departamentosResponsaveisSelecionados.length
    ? lista.filter((item) => departamentosResponsaveisSelecionados.includes(item.departamentoResponsavelId))
    : lista
  const ativasVisiveis = filtrarPorDepartamento(itens)
  const concluidasVisiveis = filtrarPorDepartamento(concluidas)
  const departamentosJaExibidos = new Set<number>()
  const nomesDepartamentos = new Map(departamentos.map(({ id, nome }) => [id, nome]))
  const nomeDepartamento = (id: number) => nomesDepartamentos.get(id) ?? `Departamento #${id}`
  const alteracoesBloqueadas = acaoEmAndamento || estadoFila !== 'pronta'
  const podeReabrir = !alteracoesBloqueadas && Boolean(onReabrir)
  const podeConcluir = !alteracoesBloqueadas && Boolean(onConcluir)

  function iniciarArraste(evento: DragEvent<HTMLLIElement>, origem: OrigemArraste, id: number) {
    evento.dataTransfer.effectAllowed = 'move'
    evento.dataTransfer.setData(tiposArraste[origem], String(id))
    setOrigemArraste(origem)
  }

  function terminarArraste() {
    setOrigemArraste(null)
  }

  function aceitarArraste(evento: DragEvent<HTMLElement>, origem: OrigemArraste) {
    if (origemArraste !== origem || !evento.dataTransfer.types.includes(tiposArraste[origem])) return false

    evento.preventDefault()
    return true
  }

  function permitirSoltar(evento: DragEvent<HTMLElement>, origem: OrigemArraste) {
    if (aceitarArraste(evento, origem)) evento.dataTransfer.dropEffect = 'move'
  }

  function soltarCartao(evento: DragEvent<HTMLElement>, origem: OrigemArraste) {
    if (!aceitarArraste(evento, origem)) return

    const id = evento.dataTransfer.getData(tiposArraste[origem])
    const itensOrigem = origem === 'ativa' ? ativasVisiveis : concluidasVisiveis
    const item = itensOrigem.find((solicitacao) => String(solicitacao.id) === id)
    terminarArraste()

    if (!item) return
    const mover = origem === 'ativa' ? onConcluir : onReabrir
    mover?.(item.id)
  }

  return (
    <div className="colunas-fila">
      <section
        className="coluna-fila"
        aria-labelledby="titulo-ativas"
        data-destino-arraste={podeReabrir && origemArraste === 'concluida' ? 'ativo' : undefined}
        onDragOver={podeReabrir ? (evento) => permitirSoltar(evento, 'concluida') : undefined}
        onDrop={podeReabrir ? (evento) => soltarCartao(evento, 'concluida') : undefined}
      >
        <h2 id="titulo-ativas">Ativas</h2>
        {ativasVisiveis.length === 0 ? (
          <p role="status">Nenhuma solicitação ativa.</p>
        ) : (
          <ol className="lista-fila" aria-label="Ordem de atendimento" role="list">
            {ativasVisiveis.map((item) => {
              const proxima = !departamentosJaExibidos.has(item.departamentoResponsavelId)
              departamentosJaExibidos.add(item.departamentoResponsavelId)

              return (
                <CartaoSolicitacao
                  key={item.id}
                  item={item}
                  departamentoSolicitante={nomeDepartamento(item.departamentoSolicitanteId)}
                  departamentoResponsavel={nomeDepartamento(item.departamentoResponsavelId)}
                  proxima={proxima}
                  acaoEmAndamento={alteracoesBloqueadas}
                  onAlterarPrioridade={onAlterarPrioridade}
                  onAlterarDescricao={onAlterarDescricao}
                  onConcluir={onConcluir}
                  onArrastar={podeConcluir ? (evento) => iniciarArraste(evento, 'ativa', item.id) : undefined}
                  onTerminarArraste={terminarArraste}
                />
              )
            })}
          </ol>
        )}
      </section>

      <section
        className="coluna-fila"
        aria-labelledby="titulo-concluidas"
        data-destino-arraste={podeConcluir && origemArraste === 'ativa' ? 'ativo' : undefined}
        onDragOver={podeConcluir ? (evento) => permitirSoltar(evento, 'ativa') : undefined}
        onDrop={podeConcluir ? (evento) => soltarCartao(evento, 'ativa') : undefined}
      >
        <h2 id="titulo-concluidas">Concluídas</h2>
        {concluidasVisiveis.length === 0 ? (
          <p role="status">Nenhuma solicitação concluída.</p>
        ) : (
          <ul className="lista-fila" role="list">
            {concluidasVisiveis.map((item) => (
              <CartaoSolicitacao
                key={item.id}
                item={item}
                departamentoSolicitante={nomeDepartamento(item.departamentoSolicitanteId)}
                departamentoResponsavel={nomeDepartamento(item.departamentoResponsavelId)}
                concluida
                acaoEmAndamento={alteracoesBloqueadas}
                onAlterarDescricao={onAlterarDescricao}
                onReabrir={onReabrir}
                onArrastar={podeReabrir ? (evento) => iniciarArraste(evento, 'concluida', item.id) : undefined}
                onTerminarArraste={terminarArraste}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
