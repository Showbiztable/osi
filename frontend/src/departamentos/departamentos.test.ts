import { afterEach, expect, it, vi } from 'vitest'
import { cadastrarDepartamento, listarDepartamentos } from './departamentos'

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

it('envia o nome e devolve o departamento criado pela API', async () => {
  const departamento = { id: 30, nome: 'Jurídico' }
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json(departamento, { status: 201 }))
  vi.stubGlobal('fetch', fetchMock)

  await expect(cadastrarDepartamento(departamento.nome)).resolves.toEqual(departamento)
  expect(fetchMock).toHaveBeenCalledWith('/api/departamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: departamento.nome }),
  })
})

it.each([
  [400, 'Informe o nome do departamento.'],
  [409, 'Já existe um departamento com esse nome.'],
] as const)('traduz a resposta %i para uma mensagem de cadastro', async (status, mensagem) => {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status }))
  vi.stubGlobal('fetch', fetchMock)

  await expect(cadastrarDepartamento('Jurídico')).rejects.toThrow(mensagem)
})
