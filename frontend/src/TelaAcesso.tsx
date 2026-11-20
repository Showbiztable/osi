import { useState, type SubmitEvent } from 'react'
import { entrarNaDemo, verificarConexao } from './acesso'

type TelaAcessoProps = {
  aoEntrar: () => void
  sessaoExpirada: boolean
}

type RetornoAcesso = {
  estado: 'aguardando' | 'erro' | 'sucesso'
  mensagem: string
}

export function TelaAcesso({ aoEntrar, sessaoExpirada }: TelaAcessoProps) {
  const [retorno, setRetorno] = useState<RetornoAcesso | null>(
    sessaoExpirada ? { estado: 'erro', mensagem: 'Sua sessão expirou. Informe o código para entrar novamente.' } : null,
  )
  const aguardando = retorno?.estado === 'aguardando'

  async function enviarCodigo(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    const codigo = String(new FormData(evento.currentTarget).get('codigo') ?? '')

    if (!codigo.trim()) {
      setRetorno({ estado: 'erro', mensagem: 'Informe o código de acesso.' })
      return
    }

    setRetorno({ estado: 'aguardando', mensagem: 'Entrando…' })
    try {
      await entrarNaDemo(codigo)
      aoEntrar()
    } catch (erro) {
      const mensagem = erro instanceof Error && !(erro instanceof TypeError)
        ? erro.message
        : 'Não foi possível conectar à API. Tente novamente.'
      setRetorno({ estado: 'erro', mensagem })
    }
  }

  async function checarConexao() {
    setRetorno({ estado: 'aguardando', mensagem: 'Verificando conexão…' })
    const disponivel = await verificarConexao()
    setRetorno(
      disponivel
        ? { estado: 'sucesso', mensagem: 'API disponível.' }
        : { estado: 'erro', mensagem: 'API indisponível no momento. Tente novamente em instantes.' },
    )
  }

  return (
    <main className="conteudo conteudo-acesso">
      <section className="painel" aria-labelledby="titulo-acesso">
        <div className="painel-cabecalho">
          <h1 id="titulo-acesso">Acesso à demo</h1>
          <p>Informe o código que você recebeu com o link.</p>
        </div>

        <form onSubmit={enviarCodigo} aria-labelledby="titulo-acesso">
          <div className="campos">
            <label className="campo">
              Código de acesso
              <input type="password" name="codigo" autoComplete="off" required disabled={aguardando} />
            </label>
            {retorno && (
              <p
                className={retorno.estado === 'aguardando' ? undefined : `mensagem ${retorno.estado}`}
                role={retorno.estado === 'erro' ? 'alert' : 'status'}
              >
                {retorno.mensagem}
              </p>
            )}
          </div>

          <div className="acoes">
            <button type="button" className="botao-secundario" onClick={checarConexao} disabled={aguardando}>
              Verificar conexão
            </button>
            <button type="submit" disabled={aguardando}>Entrar</button>
          </div>
        </form>
      </section>
    </main>
  )
}
