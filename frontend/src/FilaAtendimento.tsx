import { CartaoSolicitacao } from './CartaoSolicitacao'
import type { Departamento } from './departamentos'
import type { ItemFila } from './solicitacoes'

type FilaAtendimentoProps = {
  itens: ItemFila[]
  concluidas?: ItemFila[]
  departamentos?: Departamento[]
  departamentosResponsaveisSelecionados?: number[]
  acaoEmAndamento?: boolean
  onAlterarPrioridade?: (solicitacaoId: number, prioridade: ItemFila['prioridade']) => void
  onConcluir?: (solicitacaoId: number) => void
}

export function FilaAtendimento({
  itens,
  concluidas = [],
  departamentos = [],
  departamentosResponsaveisSelecionados = [],
  acaoEmAndamento = false,
  onAlterarPrioridade,
  onConcluir,
}: FilaAtendimentoProps) {
  const filtrarPorDepartamento = (lista: ItemFila[]) => departamentosResponsaveisSelecionados.length
    ? lista.filter((item) => departamentosResponsaveisSelecionados.includes(item.departamentoResponsavelId))
    : lista
  const ativasVisiveis = filtrarPorDepartamento(itens)
  const concluidasVisiveis = filtrarPorDepartamento(concluidas)
  const departamentosJaExibidos = new Set<number>()
  const nomesDepartamentos = new Map(departamentos.map(({ id, nome }) => [id, nome]))
  const nomeDepartamento = (id: number) => nomesDepartamentos.get(id) ?? `Departamento #${id}`

  return (
    <div className="colunas-fila">
      <section className="coluna-fila" aria-labelledby="titulo-ativas">
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
                  acaoEmAndamento={acaoEmAndamento}
                  onAlterarPrioridade={onAlterarPrioridade}
                  onConcluir={onConcluir}
                />
              )
            })}
          </ol>
        )}
      </section>

      <section className="coluna-fila" aria-labelledby="titulo-concluidas">
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
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
