import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { TelaAcesso } from './TelaAcesso'

it('mostra a verificação no cabeçalho e aguarda a prontidão para liberar a entrada', () => {
  const pagina = renderToStaticMarkup(<TelaAcesso aoEntrar={() => {}} sessaoExpirada={false} />)

  expect(pagina).toMatch(/<p\b[^>]*role="status"[^>]*>Verificando conexão…<\/p>/)
  expect(pagina).toMatch(/<button\b[^>]*disabled=""[^>]*>Entrar<\/button>/)
})
