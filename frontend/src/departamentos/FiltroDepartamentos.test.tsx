import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { FiltroDepartamentos } from './FiltroDepartamentos'

it('mostra os nomes selecionados com as opções recolhidas e permite limpar o filtro', () => {
  const ti = { id: 10, nome: 'TI' }
  const financeiro = { id: 20, nome: 'Financeiro' }
  const suporte = { id: 30, nome: 'Suporte' }

  const pagina = renderToStaticMarkup(
    <FiltroDepartamentos
      departamentos={[ti, financeiro, suporte]}
      selecionados={[ti.id, suporte.id]}
      desabilitado={false}
      aoAlterar={() => {}}
      aoLimpar={() => {}}
    />,
  )

  const controle = pagina.match(/<button\b[^>]*>Filtro<\/button>/)?.[0]
  const idDasOpcoes = controle?.match(/aria-controls="([^"]+)"/)?.[1]
  const grupoDeOpcoes = pagina.match(/<fieldset\b[^>]*>/)?.[0]

  expect(controle).toBeDefined()
  expect(controle).toContain('aria-expanded="false"')
  expect(idDasOpcoes).toBeDefined()
  expect(grupoDeOpcoes).toContain(`id="${idDasOpcoes}"`)
  expect(grupoDeOpcoes).toContain('hidden=""')
  expect(pagina).toContain('<li>TI</li><li>Suporte</li>')
  expect(pagina).toMatch(/<button\b[^>]*>Limpar filtros<\/button>/)
})
