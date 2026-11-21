import { useCallback, useEffect, useState } from 'react'
import { FilaAtendimento } from './FilaAtendimento'
import { FiltroDepartamentos } from './FiltroDepartamentos'
import { FormularioSolicitacao } from './FormularioSolicitacao'
import { TelaAcesso } from './TelaAcesso'
import { TelaDepartamentos } from './TelaDepartamentos'
import { SessaoExpiradaError } from './acesso'
import { listarDepartamentos, type Departamento } from './departamentos'
import {
  alterarPrioridade,
  concluirSolicitacao,
  listarConcluidas,
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
  | { estado: 'pronta'; ativas: ItemFila[]; concluidas: ItemFila[] }

type AcaoFila = {
  tipo: keyof typeof mensagensAcaoFila
  estado: 'enviando' | 'erro'
}

type PainelSolicitacoesProps = { aoExpirarSessao: () => void }

type SessaoDemo = { estado: 'acesso' | 'ativa' | 'expirada' }

type Pagina = 'fila' | 'departamentos'

function paginaDaUrl(): Pagina {
  return typeof window !== 'undefined' && window.location.hash === '#departamentos' ? 'departamentos' : 'fila'
}

function Cabecalho({ pagina }: { pagina?: Pagina }) {
  return (
    <header className="barra-topo">
      <div className="barra-topo-conteudo">
        <div className="marca">
          <span className="marca-sigla">OSI</span>
          <span>Organização de Solicitações Internas</span>
        </div>
        {pagina && (
          <nav className="navegacao-topo" aria-label="Navegação principal">
            <a href="#fila" aria-current={pagina === 'fila' ? 'page' : undefined}>Fila de atendimento</a>
            <a href="#departamentos" aria-current={pagina === 'departamentos' ? 'page' : undefined}>Departamentos</a>
          </nav>
        )}
      </div>
    </header>
  )
}

export function PainelSolicitacoes({ aoExpirarSessao }: PainelSolicitacoesProps) {
  const [pagina, setPagina] = useState(paginaDaUrl)
  const [catalogo, setCatalogo] = useState<Catalogo>({ estado: 'carregando' })
  const [departamentosSelecionados, setDepartamentosSelecionados] = useState<number[]>([])
  const [fila, setFila] = useState<Fila>({ estado: 'carregando' })
  const [revisaoFila, setRevisaoFila] = useState(0)
  const [acaoFila, setAcaoFila] = useState<AcaoFila | null>(null)
  const departamentos = catalogo.estado === 'pronto' ? catalogo.departamentos : []
  const acaoEmAndamento = acaoFila?.estado === 'enviando'

  useEffect(() => {
    const atualizarPagina = () => setPagina(paginaDaUrl())
    window.addEventListener('hashchange', atualizarPagina)
    return () => window.removeEventListener('hashchange', atualizarPagina)
  }, [])

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
    Promise.all([listarFila(), listarConcluidas()]).then(
      ([ativas, concluidas]) => {
        if (!substituida) setFila({ estado: 'pronta', ativas, concluidas })
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

  function limparFiltroDepartamentos() {
    setDepartamentosSelecionados([])
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

  function adicionarDepartamento(departamento: Departamento) {
    setCatalogo((atual) => {
      if (atual.estado !== 'pronto') return atual
      const departamentos = [...atual.departamentos, departamento]
      departamentos.sort((primeiro, segundo) => primeiro.nome.localeCompare(segundo.nome, 'pt-BR'))
      return { estado: 'pronto', departamentos }
    })
  }

  if (pagina === 'departamentos') {
    return (
      <>
        <Cabecalho pagina={pagina} />
        <TelaDepartamentos
          departamentos={departamentos}
          estadoCatalogo={catalogo.estado}
          aoCadastrar={adicionarDepartamento}
          aoExpirarSessao={aoExpirarSessao}
        />
      </>
    )
  }

  return (
    <>
      <Cabecalho pagina={pagina} />

      <main className="conteudo">
        <section className="painel painel-fila" aria-labelledby="titulo-fila">
          <div className="painel-cabecalho">
            <h1 id="titulo-fila">Fila de atendimento</h1>
          </div>
          <div className="campos">
            <FiltroDepartamentos
              departamentos={departamentos}
              selecionados={departamentosSelecionados}
              desabilitado={acaoEmAndamento}
              aoAlterar={alterarFiltroDepartamento}
              aoLimpar={limparFiltroDepartamentos}
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
                itens={fila.ativas}
                concluidas={fila.concluidas}
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
