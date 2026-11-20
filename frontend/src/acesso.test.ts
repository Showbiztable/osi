import { afterEach, expect, it, vi } from 'vitest'
import { entrarNaDemo, verificarConexao } from './acesso'

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

it('informa que o código está incorreto quando a API responde 401', async () => {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 401 }))
  vi.stubGlobal('fetch', fetchMock)

  await expect(entrarNaDemo('codigo-incorreto')).rejects.toThrow('Código de acesso incorreto.')
})

it('informa o tempo de espera quando a API bloqueia novas tentativas', async () => {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, {
    status: 429,
    headers: { 'Retry-After': '30' },
  }))
  vi.stubGlobal('fetch', fetchMock)

  await expect(entrarNaDemo('codigo-ficticio-da-demo')).rejects.toThrow('Aguarde 30 segundos')
})

it('confirma a conexão com a resposta 204 da API', async () => {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetchMock)

  await expect(verificarConexao()).resolves.toBe(true)
  expect(fetchMock).toHaveBeenCalledWith('/api/saude', {
    method: 'GET',
    cache: 'no-store',
    credentials: 'omit',
  })
})

it('indica indisponibilidade ao receber uma página de inicialização', async () => {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('<p>Iniciando serviço…</p>', {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  }))
  vi.stubGlobal('fetch', fetchMock)

  await expect(verificarConexao()).resolves.toBe(false)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('indica indisponibilidade quando a requisição falha', async () => {
  const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Falha de rede'))
  vi.stubGlobal('fetch', fetchMock)

  await expect(verificarConexao()).resolves.toBe(false)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
