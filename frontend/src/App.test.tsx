import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
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
})

it('oferece os campos e a ação para cadastrar uma solicitação', () => {
  const pagina = renderToStaticMarkup(<PainelSolicitacoes aoExpirarSessao={() => {}} />)

  expect(pagina).toContain('href="#titulo-cadastro"')
  expect(pagina).toContain('id="titulo-cadastro"')
  expect(pagina).toContain('<form')
  expect(pagina).toContain('name="descricao"')
  expect(pagina).toContain('name="departamentoSolicitanteId"')
  expect(pagina).toContain('name="departamentoResponsavelId"')
  expect(pagina).toContain('name="prioridade"')
  expect(pagina).toContain('type="submit"')
})

it('mostra o carregamento da fila geral ao abrir o painel', () => {
  const pagina = renderToStaticMarkup(<PainelSolicitacoes aoExpirarSessao={() => {}} />)

  expect(pagina.includes('Carregando fila…'), 'O painel deve abrir com a fila em carregamento').toBe(true)
  expect(pagina).toMatch(/<option\b[^>]*\bselected=""[^>]*>Todos os departamentos<\/option>/)
})
