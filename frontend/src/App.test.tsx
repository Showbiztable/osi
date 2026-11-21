import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import App, { PainelSolicitacoes } from './App'
import { FormularioSolicitacao } from './FormularioSolicitacao'
import { TelaDepartamentos } from './TelaDepartamentos'

it('mostra a tela de acesso antes do painel de solicitações', () => {
  const pagina = renderToStaticMarkup(<App />)

  expect(pagina).toContain('Código de acesso')
  expect(pagina).toContain('name="codigo"')
  expect(pagina).toContain('type="password"')
  expect(pagina).toContain('>Entrar</button>')
  expect(pagina).toContain('>Verificar conexão</button>')
  expect(pagina).not.toContain('name="descricao"')
  expect(pagina).not.toContain('id="titulo-fila"')
  expect(pagina).not.toContain('href="#departamentos"')
})

it('oferece o formulário de cadastro direto no painel, sem atalho duplicado', () => {
  const pagina = renderToStaticMarkup(<PainelSolicitacoes aoExpirarSessao={() => {}} />)

  expect(pagina).toContain('id="titulo-cadastro"')
  expect(pagina).toContain('<form')
  expect(pagina).toContain('name="descricao"')
  expect(pagina).toContain('name="departamentoSolicitanteId"')
  expect(pagina).toContain('name="departamentoResponsavelId"')
  const prioridades = pagina.match(/<select\b[^>]*name="prioridade"[^>]*>[\s\S]*?<\/select>/)?.[0]
  expect(prioridades).toBeDefined()
  for (const prioridade of ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']) {
    expect(prioridades).toContain(`data-prioridade="${prioridade}"`)
  }
  expect(pagina).toContain('type="submit"')
  expect(pagina).not.toMatch(/<(?:a|button)\b[^>]*>Nova solicitação<\/(?:a|button)>/)
})

it('mostra o carregamento da fila geral ao abrir o painel', () => {
  const pagina = renderToStaticMarkup(<PainelSolicitacoes aoExpirarSessao={() => {}} />)

  expect(pagina.includes('Carregando fila…'), 'O painel deve abrir com a fila em carregamento').toBe(true)
  expect(pagina).toContain('>Filtro</button>')
  expect(pagina).toContain('aria-label="Departamentos responsáveis"')
  expect(pagina).not.toContain('>Departamentos responsáveis<')
  expect(pagina).not.toContain('>Todos os departamentos<')
})

it('abre a tela de departamentos na navegação do painel autenticado', () => {
  vi.stubGlobal('window', { location: { hash: '#departamentos' } })

  try {
    const pagina = renderToStaticMarkup(<PainelSolicitacoes aoExpirarSessao={() => {}} />)

    expect(pagina).toContain('href="#fila"')
    expect(pagina).toContain('href="#departamentos" aria-current="page"')
    expect(pagina).toContain('>Departamentos</h1>')
    expect(pagina).toContain('>Cadastrar departamento</button>')
    expect(pagina).not.toContain('id="titulo-fila"')
  } finally {
    vi.unstubAllGlobals()
  }
})

it.each([
  ['no formulário de solicitação', FormularioSolicitacao],
  ['na tela de departamentos', TelaDepartamentos],
] as const)('oferece nova tentativa local quando o catálogo falha %s', (_tela, Componente) => {
  const props = {
    departamentos: [],
    estadoCatalogo: 'erro' as const,
    aoRecarregarCatalogo: () => {},
    aoCadastrar: () => {},
    aoExpirarSessao: () => {},
  }

  const pagina = renderToStaticMarkup(<Componente {...props} />)

  expect(pagina).toContain('Não foi possível carregar os departamentos.')
  expect(pagina).toMatch(/<button\b[^>]*type="button"[^>]*>Tentar novamente<\/button>/)
})
