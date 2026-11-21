import { useCallback, useState, type SubmitEvent } from 'react'
import { SessaoExpiradaError } from './acesso'
import { cadastrarDepartamento, ErroCadastroDepartamento, type Departamento } from './departamentos'
import { Notificacao, type Aviso } from './Notificacao'
import './TelaDepartamentos.css'

type TelaDepartamentosProps = {
  departamentos: Departamento[]
  estadoCatalogo: 'carregando' | 'erro' | 'pronto'
  aoRecarregarCatalogo: () => void
  aoCadastrar: (departamento: Departamento) => void
  aoExpirarSessao: () => void
}

export function TelaDepartamentos({
  departamentos,
  estadoCatalogo,
  aoRecarregarCatalogo,
  aoCadastrar,
  aoExpirarSessao,
}: TelaDepartamentosProps) {
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const dispensarAviso = useCallback(() => setAviso(null), [])

  async function enviarCadastro(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const nome = String(new FormData(formulario).get('nome') ?? '').trim()

    if (!nome) {
      setAviso({ tipo: 'erro', mensagem: 'Informe o nome do departamento.' })
      return
    }

    setAviso(null)
    setEnviando(true)
    try {
      const departamento = await cadastrarDepartamento(nome)
      formulario.reset()
      aoCadastrar(departamento)
      setAviso({ tipo: 'sucesso', mensagem: `Departamento ${departamento.nome} cadastrado com sucesso.` })
    } catch (erro) {
      if (erro instanceof SessaoExpiradaError) {
        aoExpirarSessao()
        return
      }
      const mensagem = erro instanceof ErroCadastroDepartamento
        ? erro.message
        : 'Não foi possível cadastrar o departamento. Tente novamente.'
      setAviso({ tipo: 'erro', mensagem })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="conteudo">
      <section className="painel" aria-labelledby="titulo-departamentos">
        <div className="painel-cabecalho">
          <h1 id="titulo-departamentos">Departamentos</h1>
        </div>
        <div className="campos">
          {estadoCatalogo === 'carregando' && <p role="status">Carregando departamentos…</p>}
          {estadoCatalogo === 'erro' && (
            <div className="erro-carregamento">
              <p id="erro-catalogo-departamentos" className="mensagem erro" role="alert">
                Não foi possível carregar os departamentos.
              </p>
              <button type="button" aria-describedby="erro-catalogo-departamentos" onClick={aoRecarregarCatalogo}>
                Tentar novamente
              </button>
            </div>
          )}
          {estadoCatalogo === 'pronto' && departamentos.length === 0 && (
            <p role="status">Nenhum departamento cadastrado.</p>
          )}
          {departamentos.length > 0 && (
            <ul className="lista-departamentos" role="list">
              {departamentos.map(({ id, nome }) => <li key={id}>{nome}</li>)}
            </ul>
          )}
        </div>
      </section>

      <section className="painel" aria-labelledby="titulo-cadastro-departamento">
        <div className="painel-cabecalho">
          <h2 id="titulo-cadastro-departamento">Novo departamento</h2>
        </div>
        <form onSubmit={enviarCadastro} aria-labelledby="titulo-cadastro-departamento">
          <fieldset className="campos" disabled={enviando || estadoCatalogo !== 'pronto'}>
            <label className="campo">
              Nome do departamento
              <input type="text" name="nome" required />
            </label>
          </fieldset>
          <div className="acoes acoes-cadastro">
            <button type="submit" disabled={enviando || estadoCatalogo !== 'pronto'}>
              {enviando ? 'Cadastrando…' : 'Cadastrar departamento'}
            </button>
          </div>
        </form>
      </section>
      <Notificacao aviso={aviso} aoDispensar={dispensarAviso} />
    </main>
  )
}
