import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { FiltroDepartamentos } from './FiltroDepartamentos'

it('recolhe o filtro de departamentos e oferece uma ação para limpar a seleção', () => {
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

  const controle = pagina.match(/<details\b[^>]*>/)?.[0]
  expect(controle).toBeDefined()
  expect(controle).not.toContain('open=')
  expect(pagina).toMatch(/<summary\b[^>]*>Filtro/)
  expect(pagina).toContain('2 selecionados')
  expect(pagina).toMatch(/<button\b[^>]*>Limpar filtros<\/button>/)
})
