import { useCallback, useState, type SubmitEvent } from 'react'
import { SessaoExpiradaError } from './acesso'
import type { Departamento } from './departamentos'
import { Notificacao, type Aviso } from './Notificacao'
import { cadastrarSolicitacao, rotulosPrioridade, type DadosCadastro } from './solicitacoes'

type FormularioSolicitacaoProps = {
  departamentos: Departamento[]
  estadoCatalogo: 'carregando' | 'erro' | 'pronto'
  aoCadastrar: () => void
  aoExpirarSessao: () => void
}

const camposDepartamento = [
  { nome: 'departamentoSolicitanteId', rotulo: 'Departamento solicitante' },
  { nome: 'departamentoResponsavelId', rotulo: 'Departamento responsável' },
] as const

export function FormularioSolicitacao({
  departamentos,
  estadoCatalogo,
  aoCadastrar,
  aoExpirarSessao,
}: FormularioSolicitacaoProps) {
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const dispensarAviso = useCallback(() => setAviso(null), [])

  async function enviarCadastro(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    const descricao = String(dados.get('descricao') ?? '').trim()

    if (!descricao) {
      setAviso({ tipo: 'erro', mensagem: 'Informe a descrição da solicitação.' })
      return
    }

    setAviso(null)
    setEnviando(true)
    try {
      const id = await cadastrarSolicitacao({
        descricao,
        departamentoSolicitanteId: Number(dados.get('departamentoSolicitanteId')),
        departamentoResponsavelId: Number(dados.get('departamentoResponsavelId')),
        prioridade: dados.get('prioridade') as DadosCadastro['prioridade'],
      })
      formulario.reset()
      setAviso({ tipo: 'sucesso', mensagem: `Solicitação #${id} cadastrada com sucesso.` })
      aoCadastrar()
    } catch (erro) {
      if (erro instanceof SessaoExpiradaError) {
        aoExpirarSessao()
        return
      }
      setAviso({ tipo: 'erro', mensagem: 'Não foi possível cadastrar. Tente novamente.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="painel" aria-labelledby="titulo-cadastro">
      <div className="painel-cabecalho">
        <h2 id="titulo-cadastro">Nova solicitação</h2>
        <p>O pedido entra na fila do departamento responsável.</p>
      </div>

      <form onSubmit={enviarCadastro} aria-labelledby="titulo-cadastro">
        <fieldset className="campos" disabled={enviando}>
          <label className="campo">
            Descrição
            <textarea
              name="descricao"
              rows={4}
              required
              placeholder="Ex.: Preciso de acesso ao sistema de notas fiscais."
            />
          </label>

          <div className="departamentos">
            {camposDepartamento.map(({ nome, rotulo }) => (
              <label className="campo" key={nome}>
                {rotulo}
                <select name={nome} defaultValue="" required disabled={!departamentos.length}>
                  <option value="" disabled>Selecione um departamento</option>
                  {departamentos.map(({ id, nome }) => (
                    <option key={id} value={id}>{nome}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {estadoCatalogo === 'carregando' && <p role="status">Carregando departamentos…</p>}
          {estadoCatalogo === 'erro' && (
            <p className="mensagem erro" role="alert">
              Não foi possível carregar os departamentos. Atualize a página para tentar novamente.
            </p>
          )}
          {estadoCatalogo === 'pronto' && !departamentos.length && (
            <p role="status">Nenhum departamento cadastrado.</p>
          )}

          <label className="campo">
            Prioridade
            <select name="prioridade" defaultValue="" required>
              <option value="" disabled>Selecione a prioridade</option>
              {Object.entries(rotulosPrioridade).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>{rotulo}</option>
              ))}
            </select>
          </label>
        </fieldset>

        <div className="acoes acoes-cadastro">
          <button type="submit" disabled={enviando || !departamentos.length}>
            {enviando ? 'Cadastrando…' : 'Cadastrar solicitação'}
          </button>
        </div>
      </form>
      <Notificacao aviso={aviso} aoDispensar={dispensarAviso} />
    </section>
  )
}
