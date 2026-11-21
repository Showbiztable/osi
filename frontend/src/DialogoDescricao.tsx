import { useState, type RefObject, type SubmitEvent } from 'react'

type DialogoDescricaoProps = {
  id: string
  dialogo: RefObject<HTMLDialogElement | null>
  solicitacaoId: number
  descricao: string
  bloquearEdicao: boolean
  aoSalvar?: (descricao: string) => Promise<void>
}

export function DialogoDescricao({ id, dialogo, solicitacaoId, descricao, bloquearEdicao, aoSalvar }: DialogoDescricaoProps) {
  const [rascunho, setRascunho] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvarDescricao(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!aoSalvar || rascunho === null || salvando || bloquearEdicao) return

    const novaDescricao = rascunho.trim()
    if (!novaDescricao) {
      setErro('Informe a descrição da solicitação.')
      return
    }

    setSalvando(true)
    setErro(null)
    try {
      await aoSalvar(novaDescricao)
      setRascunho(null)
    } catch {
      setErro('Não foi possível salvar a descrição. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  function limparEdicao() {
    setRascunho(null)
    setErro(null)
  }

  return (
    <dialog
      ref={dialogo}
      id={id}
      className="descricao-completa"
      aria-labelledby={`${id}-titulo`}
      onCancel={(evento) => { if (salvando) evento.preventDefault() }}
      onClose={limparEdicao}
    >
      <h4 id={`${id}-titulo`}>Descrição da solicitação #{solicitacaoId}</h4>
      <form onSubmit={salvarDescricao}>
        {rascunho === null ? <p>{descricao}</p> : (
          <label className="campo">
            Descrição
            <textarea
              autoFocus
              name="descricao"
              rows={5}
              required
              disabled={salvando}
              value={rascunho}
              onChange={(evento) => {
                setRascunho(evento.currentTarget.value)
                setErro(null)
              }}
            />
          </label>
        )}
        {erro && <p className="mensagem erro" role="alert">{erro}</p>}
        <div className="descricao-completa-acoes">
          {rascunho !== null ? (
            <button key="salvar" type="submit" disabled={salvando || bloquearEdicao}>
              {salvando ? 'Salvando…' : 'Salvar descrição'}
            </button>
          ) : aoSalvar && (
            <button
              key="editar"
              type="button"
              className="botao-secundario"
              disabled={bloquearEdicao}
              onClick={() => setRascunho(descricao)}
            >
              Editar descrição
            </button>
          )}
          <button type="button" disabled={salvando} onClick={() => dialogo.current?.close()}>Fechar</button>
        </div>
      </form>
    </dialog>
  )
}
