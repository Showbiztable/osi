import { useEffect } from 'react'
import './Notificacao.css'

export type Aviso = { tipo: 'sucesso' | 'erro'; mensagem: string }

type NotificacaoProps = {
  aviso: Aviso | null
  aoDispensar: () => void
}

const duracaoAvisoMs = 6_000

export function Notificacao({ aviso, aoDispensar }: NotificacaoProps) {
  useEffect(() => {
    if (!aviso) return

    const temporizador = setTimeout(aoDispensar, duracaoAvisoMs)
    return () => clearTimeout(temporizador)
  }, [aviso, aoDispensar])

  return (
    <div className="notificacao">
      <p className="mensagem sucesso" role="status">{aviso?.tipo === 'sucesso' && aviso.mensagem}</p>
      <p className="mensagem erro" role="alert">{aviso?.tipo === 'erro' && aviso.mensagem}</p>
    </div>
  )
}
