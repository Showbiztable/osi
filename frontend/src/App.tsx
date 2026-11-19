import { useEffect, useState, type SubmitEvent } from 'react'
import { FilaAtendimento } from './FilaAtendimento'
import { listarDepartamentos, type Departamento } from './departamentos'
import { cadastrarSolicitacao, listarFila, rotulosPrioridade, type DadosCadastro, type ItemFila } from './solicitacoes'
import './App.css'

const camposDepartamento = [
  { nome: 'departamentoSolicitanteId', rotulo: 'Departamento solicitante' },
  { nome: 'departamentoResponsavelId', rotulo: 'Departamento responsável' },
] as const

type Catalogo =
  | { estado: 'carregando' | 'erro' }
  | { estado: 'pronto'; departamentos: Departamento[] }

type Envio =
  | { estado: 'enviando' }
  | { estado: 'erro'; mensagem: string }
  | { estado: 'sucesso'; id: number }

type Fila =
  | { estado: 'carregando' | 'erro' }
  | { estado: 'pronta'; itens: ItemFila[] }

function App() {
  const [catalogo, setCatalogo] = useState<Catalogo>({ estado: 'carregando' })
  const [envio, setEnvio] = useState<Envio | null>(null)
  const [departamentoFila, setDepartamentoFila] = useState('')
  const [fila, setFila] = useState<Fila>({ estado: 'carregando' })
  const [revisaoFila, setRevisaoFila] = useState(0)
  const departamentos = catalogo.estado === 'pronto' ? catalogo.departamentos : []
  const enviando = envio?.estado === 'enviando'

  useEffect(() => {
    let desmontado = false
    listarDepartamentos().then(
      (departamentos) => {
        if (!desmontado) setCatalogo({ estado: 'pronto', departamentos })
      },
      () => {
        if (!desmontado) setCatalogo({ estado: 'erro' })
      },
    )
    return () => {
      desmontado = true
    }
  }, [])

  useEffect(() => {
    if (!departamentoFila) return

    let substituida = false
    listarFila(Number(departamentoFila)).then(
      (itens) => {
        if (!substituida) setFila({ estado: 'pronta', itens })
      },
      () => {
        if (!substituida) setFila({ estado: 'erro' })
      },
    )
    return () => {
      substituida = true
    }
  }, [departamentoFila, revisaoFila])

  async function enviarCadastro(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    const descricao = String(dados.get('descricao') ?? '').trim()

    if (!descricao) {
      setEnvio({ estado: 'erro', mensagem: 'Informe a descrição da solicitação.' })
      return
    }

    setEnvio({ estado: 'enviando' })
    try {
      const id = await cadastrarSolicitacao({
        descricao,
        departamentoSolicitanteId: Number(dados.get('departamentoSolicitanteId')),
        departamentoResponsavelId: Number(dados.get('departamentoResponsavelId')),
        prioridade: dados.get('prioridade') as DadosCadastro['prioridade'],
      })
      formulario.reset()
      setEnvio({ estado: 'sucesso', id })
      atualizarFila()
    } catch {
      setEnvio({ estado: 'erro', mensagem: 'Não foi possível cadastrar. Tente novamente.' })
    }
  }

  function atualizarFila() {
    setFila({ estado: 'carregando' })
    setRevisaoFila((anterior) => anterior + 1)
  }

  return (
    <>
      <header className="barra-topo">
        <div className="marca">
          <span className="marca-sigla">OSI</span>
          <span>Organização de Solicitações Internas</span>
        </div>
      </header>

      <main className="conteudo">
        <section className="painel" aria-labelledby="titulo-cadastro">
          <div className="painel-cabecalho">
            <h1 id="titulo-cadastro">Nova solicitação</h1>
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

              {catalogo.estado === 'carregando' && <p role="status">Carregando departamentos…</p>}
              {catalogo.estado === 'erro' && (
                <p className="mensagem erro" role="alert">
                  Não foi possível carregar os departamentos. Atualize a página para tentar novamente.
                </p>
              )}
              {catalogo.estado === 'pronto' && !departamentos.length && (
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

            <div className="acoes">
              {envio?.estado === 'erro' && (
                <p className="mensagem erro" role="alert">{envio.mensagem}</p>
              )}
              {envio?.estado === 'sucesso' && (
                <p className="mensagem sucesso" role="status">
                  Solicitação #{envio.id} cadastrada com sucesso.
                </p>
              )}
              <button type="submit" disabled={enviando || !departamentos.length}>
                {enviando ? 'Cadastrando…' : 'Cadastrar solicitação'}
              </button>
            </div>
          </form>
        </section>
        <section className="painel" aria-labelledby="titulo-fila">
          <div className="painel-cabecalho">
            <h2 id="titulo-fila">Fila de atendimento</h2>
          </div>
          <div className="campos">
            <label className="campo">
              Departamento da fila
              <select
                value={departamentoFila}
                disabled={!departamentos.length}
                onChange={(evento) => {
                  setFila({ estado: 'carregando' })
                  setDepartamentoFila(evento.target.value)
                }}
              >
                <option value="" disabled>Selecione um departamento</option>
                {departamentos.map(({ id, nome }) => (
                  <option key={id} value={id}>{nome}</option>
                ))}
              </select>
            </label>

            {!departamentoFila && <p>Selecione o departamento responsável para consultar a fila.</p>}
            {departamentoFila && fila.estado === 'carregando' && <p role="status">Carregando fila…</p>}
            {departamentoFila && fila.estado === 'erro' && (
              <div className="fila-erro">
                <p className="mensagem erro" role="alert">Não foi possível carregar a fila.</p>
                <button type="button" onClick={atualizarFila}>Tentar novamente</button>
              </div>
            )}
            {departamentoFila && fila.estado === 'pronta' && (
              <FilaAtendimento itens={fila.itens} departamentos={departamentos} />
            )}
          </div>
        </section>
      </main>
    </>
  )
}

export default App
