import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { TelaDepartamentos } from './TelaDepartamentos'

it('lista os departamentos do catálogo e oferece o campo de cadastro', () => {
  const pagina = renderToStaticMarkup(
    <TelaDepartamentos
      departamentos={[{ id: 10, nome: 'Financeiro' }, { id: 20, nome: 'TI' }]}
      estadoCatalogo="pronto"
      aoCadastrar={() => {}}
      aoExpirarSessao={() => {}}
    />,
  )

  expect(pagina).toContain('<li>Financeiro</li>')
  expect(pagina).toContain('<li>TI</li>')
  expect(pagina).toMatch(/<input\b[^>]*\bname="nome"[^>]*>/)
  expect(pagina).toContain('>Cadastrar departamento</button>')
})
