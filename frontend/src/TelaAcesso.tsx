import { useEffect, useState, type SubmitEvent } from 'react'
import { DemoIndisponivelError, entrarNaDemo, verificarConexao } from './acesso'
import './TelaAcesso.css'

type TelaAcessoProps = {
  aoEntrar: () => void
  sessaoExpirada: boolean
}

const rotulosDisponibilidade = {
  verificando: 'Verificando conexão…',
  preparando: 'Preparando a demo…',
  disponivel: 'Demo disponível',
  indisponivel: 'Demo indisponível',
}

export function TelaAcesso({ aoEntrar, sessaoExpirada }: TelaAcessoProps) {
  const [disponibilidade, setDisponibilidade] = useState<keyof typeof rotulosDisponibilidade>('verificando')
  const [enviando, setEnviando] = useState(false)
  const [erroAcesso, setErroAcesso] = useState(
    sessaoExpirada ? 'Sua sessão expirou. Informe o código para entrar novamente.' : '',
  )
  const verificando = disponibilidade === 'verificando' || disponibilidade === 'preparando'
  const podeEntrar = disponibilidade === 'disponivel' && !enviando

  useEffect(() => {
    const controle = new AbortController()
    void verificarConexao({ sinal: controle.signal }).then((disponivel) => {
      if (!controle.signal.aborted) setDisponibilidade(disponivel ? 'disponivel' : 'indisponivel')
    })
    return () => controle.abort()
  }, [])

  async function enviarCodigo(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!podeEntrar) return

    const codigo = String(new FormData(evento.currentTarget).get('codigo') ?? '')

    if (!codigo.trim()) {
      setErroAcesso('Informe o código de acesso.')
      return
    }

    setErroAcesso('')
    setEnviando(true)
    try {
      await entrarNaDemo(codigo)
      aoEntrar()
    } catch (erro) {
      if (erro instanceof DemoIndisponivelError) setDisponibilidade('indisponivel')
      setErroAcesso(erro instanceof Error ? erro.message : 'Não foi possível entrar na demo.')
    } finally {
      setEnviando(false)
    }
  }

  async function checarConexao() {
    setErroAcesso('')
    setDisponibilidade('preparando')
    const disponivel = await verificarConexao({ repetir: true })
    setDisponibilidade(disponivel ? 'disponivel' : 'indisponivel')
  }

  return (
    <main className="conteudo conteudo-acesso">
      <section className="painel" aria-labelledby="titulo-acesso">
        <div className="painel-cabecalho cabecalho-acesso">
          <div>
            <h1 id="titulo-acesso">Acesso à demo</h1>
            <p>Informe o código que você recebeu com o link.</p>
          </div>
          <p className="disponibilidade-demo" data-disponibilidade={disponibilidade} role="status">{rotulosDisponibilidade[disponibilidade]}</p>
        </div>

        <form onSubmit={enviarCodigo} aria-labelledby="titulo-acesso">
          <div className="campos">
            <label className="campo">
              Código de acesso
              <input type="password" name="codigo" autoComplete="off" required disabled={enviando} />
            </label>
            {disponibilidade === 'preparando' && <p>O primeiro acesso pode levar cerca de um minuto.</p>}
            {disponibilidade === 'indisponivel' && <p>Use <strong>Verificar conexão</strong> para tentar novamente.</p>}
            {erroAcesso && <p className="mensagem erro" role="alert">{erroAcesso}</p>}
          </div>

          <div className="acoes">
            <button type="button" className="botao-secundario" onClick={checarConexao} disabled={verificando || enviando}>
              Verificar conexão
            </button>
            <button type="submit" disabled={!podeEntrar}>{enviando ? 'Entrando…' : 'Entrar'}</button>
          </div>
        </form>
      </section>
    </main>
  )
}
