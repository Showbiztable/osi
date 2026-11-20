export class SessaoExpiradaError extends Error {
  constructor() {
    super('Sessão expirada.')
    this.name = 'SessaoExpiradaError'
  }
}

export async function requisitarComSessao(...argumentos: Parameters<typeof fetch>): Promise<Response> {
  const resposta = await fetch(...argumentos)
  if (resposta.status === 401) {
    throw new SessaoExpiradaError()
  }
  return resposta
}

export async function entrarNaDemo(codigo: string): Promise<void> {
  const resposta = await fetch('/api/acesso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  })

  if (resposta.status === 204) return

  if (resposta.status === 401) {
    throw new Error('Código de acesso incorreto.')
  }

  if (resposta.status === 429) {
    const segundos = Number(resposta.headers.get('Retry-After'))
    const unidade = segundos === 1 ? 'segundo' : 'segundos'
    const espera = Number.isSafeInteger(segundos) && segundos > 0 ? `${segundos} ${unidade}` : 'um momento'
    throw new Error(`Muitas tentativas. Aguarde ${espera} e tente novamente.`)
  }

  throw new Error('Não foi possível entrar na demo.')
}

export async function verificarConexao(): Promise<boolean> {
  const controle = new AbortController()
  const temporizador = setTimeout(() => controle.abort(), 10_000)

  try {
    const resposta = await fetch('/api/saude', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      signal: controle.signal,
    })
    return resposta.status === 204
  } catch {
    return false
  } finally {
    clearTimeout(temporizador)
  }
}
