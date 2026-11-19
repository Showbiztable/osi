import { afterEach, expect, it, vi } from 'vitest'
import { listarDepartamentos } from './departamentos'

afterEach(() => {
  vi.unstubAllGlobals()
})

it('carrega os IDs e nomes dos departamentos cadastrados', async () => {
  const departamentos = [
    { id: 10, nome: 'Financeiro' },
    { id: 20, nome: 'TI' },
  ]
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json(departamentos))
  vi.stubGlobal('fetch', fetchMock)

  const resultado = await listarDepartamentos()

  expect(resultado).toEqual(departamentos)
  expect(fetchMock).toHaveBeenCalledWith('/api/departamentos')
})
