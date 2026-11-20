import { afterEach, expect, it, vi } from 'vitest'
import { entrarNaDemo } from './acesso'

afterEach(() => {
  vi.unstubAllGlobals()
})

it('envia o código de acesso e confirma a entrada com a resposta 204', async () => {
  const codigo = 'codigo-ficticio-da-demo'
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetchMock)

  await expect(entrarNaDemo(codigo)).resolves.toBeUndefined()

  expect(fetchMock).toHaveBeenCalledWith('/api/acesso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  })
})

it('rejeita uma página HTML de inicialização com status 200', async () => {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('<p>Iniciando serviço…</p>', {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  }))
  vi.stubGlobal('fetch', fetchMock)

  await expect(entrarNaDemo('codigo-ficticio-da-demo')).rejects.toThrow()
})
