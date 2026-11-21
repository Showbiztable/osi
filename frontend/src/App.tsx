import { useCallback, useEffect, useState } from 'react'
import { FilaAtendimento } from './FilaAtendimento'
import { FiltroDepartamentos } from './FiltroDepartamentos'
import { FormularioSolicitacao } from './FormularioSolicitacao'
import { TelaAcesso } from './TelaAcesso'
import { SessaoExpiradaError } from './acesso'
import { listarDepartamentos, type Departamento } from './departamentos'
import {
  alterarPrioridade,
  concluirSolicitacao,
  listarFila,
  type ItemFila,
} from './solicitacoes'
import './App.css'

const mensagensAcaoFila = {
  prioridade: {
    enviando: 'Alterando prioridade…',
    erro: 'Não foi possível alterar a prioridade. Tente novamente.',
  },
  conclusao: {
    enviando: 'Concluindo solicitação…',
    erro: 'Não foi possível concluir a solicitação. Tente novamente.',
  },
}

type Catalogo =
  | { estado: 'carregando' | 'erro' }
  | { estado: 'pronto'; departamentos: Departamento[] }

type Fila =
  | { estado: 'carregando' | 'erro' }
  | { estado: 'pronta'; itens: ItemFila[] }

type AcaoFila = {
  tipo: keyof typeof mensagensAcaoFila
  estado: 'enviando' | 'erro'
}

type PainelSolicitacoesProps = { aoExpirarSessao: () => void }

type SessaoDemo = { estado: 'acesso' | 'ativa' | 'expirada' }

function Cabecalho() {
  return (
    <header className="barra-topo">
      <div className="marca">
        <span className="marca-sigla">OSI</span>
        <span>Organização de Solicitações Internas</span>
      </div>
    </header>
  )
}

export function PainelSolicitacoes({ aoExpirarSessao }: PainelSolicitacoesProps) {
  const [catalogo, setCatalogo] = useState<Catalogo>({ estado: 'carregando' })
  const [departamentosSelecionados, setDepartamentosSelecionados] = useState<number[]>([])
  const [fila, setFila] = useState<Fila>({ estado: 'carregando' })
  const [revisaoFila, setRevisaoFila] = useState(0)
  const [acaoFila, setAcaoFila] = useState<AcaoFila | null>(null)
  const departamentos = catalogo.estado === 'pronto' ? catalogo.departamentos : []
  const acaoEmAndamento = acaoFila?.estado === 'enviando'

  const tratarSessaoExpirada = useCallback((erro: unknown) => {
    if (!(erro instanceof SessaoExpiradaError)) return false
    aoExpirarSessao()
    return true
  }, [aoExpirarSessao])

  useEffect(() => {
    let desmontado = false
    listarDepartamentos().then(
      (departamentos) => {
        if (!desmontado) setCatalogo({ estado: 'pronto', departamentos })
      },
      (erro) => {
        if (desmontado || tratarSessaoExpirada(erro)) return
        setCatalogo({ estado: 'erro' })
      },
    )
    return () => {
      desmontado = true
    }
  }, [tratarSessaoExpirada])

  useEffect(() => {
    let substituida = false
    listarFila().then(
      (itens) => {
        if (!substituida) setFila({ estado: 'pronta', itens })
      },
      (erro) => {
        if (substituida || tratarSessaoExpirada(erro)) return
        setFila({ estado: 'erro' })
      },
    )
    return () => {
      substituida = true
    }
  }, [revisaoFila, tratarSessaoExpirada])

  function alterarFiltroDepartamento(departamentoId: number, selecionado: boolean) {
    setDepartamentosSelecionados((atuais) => selecionado
      ? [...atuais, departamentoId]
      : atuais.filter((id) => id !== departamentoId)
    )
    setAcaoFila(null)
  }

  function atualizarFila() {
    setFila({ estado: 'carregando' })
    setRevisaoFila((anterior) => anterior + 1)
  }

  async function executarAcaoDaFila(tipo: AcaoFila['tipo'], executar: () => Promise<void>) {
    setAcaoFila({ tipo, estado: 'enviando' })

    try {
      await executar()
      setAcaoFila(null)
      atualizarFila()
    } catch (erro) {
      if (tratarSessaoExpirada(erro)) return
      setAcaoFila({ tipo, estado: 'erro' })
    }
  }

  return (
    <>
      <Cabecalho />

      <main className="conteudo">
        <section className="painel painel-fila" aria-labelledby="titulo-fila">
          <div className="painel-cabecalho cabecalho-fila">
            <h1 id="titulo-fila">Fila de atendimento</h1>
            <a className="atalho-cadastro" href="#titulo-cadastro">Nova solicitação</a>
          </div>
          <div className="campos">
            <FiltroDepartamentos
              departamentos={departamentos}
              selecionados={departamentosSelecionados}
              desabilitado={acaoEmAndamento}
              aoAlterar={alterarFiltroDepartamento}
            />

            {fila.estado === 'carregando' && <p role="status">Carregando fila…</p>}
            {fila.estado === 'erro' && (
              <div className="fila-erro">
                <p className="mensagem erro" role="alert">Não foi possível carregar a fila.</p>
                <button type="button" onClick={atualizarFila}>Tentar novamente</button>
              </div>
            )}
            {acaoFila && (
              <p
                className={acaoFila.estado === 'erro' ? 'mensagem erro' : undefined}
                role={acaoFila.estado === 'erro' ? 'alert' : 'status'}
              >
                {mensagensAcaoFila[acaoFila.tipo][acaoFila.estado]}
              </p>
            )}
            {fila.estado === 'pronta' && (
              <FilaAtendimento
                itens={fila.itens}
                departamentos={departamentos}
                departamentosResponsaveisSelecionados={departamentosSelecionados}
                acaoEmAndamento={acaoEmAndamento}
                onAlterarPrioridade={(id, prioridade) =>
                  executarAcaoDaFila('prioridade', () => alterarPrioridade(id, prioridade))
                }
                onConcluir={(id) => executarAcaoDaFila('conclusao', () => concluirSolicitacao(id))}
              />
            )}
          </div>
        </section>
        <FormularioSolicitacao
          departamentos={departamentos}
          estadoCatalogo={catalogo.estado}
          aoCadastrar={atualizarFila}
          aoExpirarSessao={aoExpirarSessao}
        />
      </main>
    </>
  )
}

function App() {
  const [sessao, setSessao] = useState<SessaoDemo>({ estado: 'acesso' })
  const expirarSessao = useCallback(() => {
    // Uma resposta atrasada só pode encerrar a sessão que originou a chamada.
    setSessao((atual) => atual === sessao ? { estado: 'expirada' } : atual)
  }, [sessao])

  if (sessao.estado === 'ativa') return <PainelSolicitacoes aoExpirarSessao={expirarSessao} />

  return (
    <>
      <Cabecalho />
      <TelaAcesso
        aoEntrar={() => setSessao({ estado: 'ativa' })}
        sessaoExpirada={sessao.estado === 'expirada'}
      />
    </>
  )
}

export default App
