import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import App from './App'

it('oferece os campos e a ação para cadastrar uma solicitação', () => {
  const pagina = renderToStaticMarkup(<App />)

  expect(pagina).toContain('<form')
  expect(pagina).toContain('name="descricao"')
  expect(pagina).toContain('name="departamentoSolicitanteId"')
  expect(pagina).toContain('name="departamentoResponsavelId"')
  expect(pagina).toContain('name="prioridade"')
  expect(pagina).toContain('type="submit"')
})
