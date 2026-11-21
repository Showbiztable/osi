import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import App, { PainelSolicitacoes } from './App'

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
  expect(pagina).toContain('name="prioridade"')
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
