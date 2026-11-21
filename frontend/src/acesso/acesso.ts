export class SessaoExpiradaError extends Error {
  constructor() {
    super('Sessão expirada.')
    this.name = 'SessaoExpiradaError'
  }
}

export class DemoIndisponivelError extends Error {
  constructor() {
    super('Não foi possível entrar. Verifique a conexão com a demo.')
    this.name = 'DemoIndisponivelError'
  }
}

const prazoRequisicaoMs = 10_000
const prazoVerificacaoManualMs = 75_000
const intervaloTentativasMs = 3_000

export async function requisitarComSessao(...argumentos: Parameters<typeof fetch>): Promise<Response> {
  const resposta = await fetch(...argumentos)
  if (resposta.status === 401) {
    throw new SessaoExpiradaError()
  }
  return resposta
}

async function requisitarComPrazo(endereco: string, opcoes: RequestInit, prazoMs: number, sinal?: AbortSignal) {
  const controle = new AbortController()
  const temporizador = setTimeout(() => controle.abort(), prazoMs)
  try {
    return await fetch(endereco, {
      ...opcoes,
      signal: sinal ? AbortSignal.any([controle.signal, sinal]) : controle.signal,
    })
  } finally {
    clearTimeout(temporizador)
  }
}

export async function entrarNaDemo(codigo: string): Promise<void> {
  let resposta: Response
  try {
    resposta = await requisitarComPrazo('/api/acesso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo }),
    }, prazoRequisicaoMs)
  } catch {
    throw new DemoIndisponivelError()
  }

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

  throw new DemoIndisponivelError()
}

async function verificarProntidao(prazoMs: number, sinal?: AbortSignal): Promise<boolean> {
  try {
    const resposta = await requisitarComPrazo('/api/prontidao', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
    }, prazoMs, sinal)
    return resposta.status === 204
  } catch {
    return false
  }
}

type OpcoesVerificacao = { repetir?: boolean; sinal?: AbortSignal }

export async function verificarConexao({ repetir = false, sinal }: OpcoesVerificacao = {}): Promise<boolean> {
  if (!repetir) return verificarProntidao(prazoRequisicaoMs, sinal)

  const limite = Date.now() + prazoVerificacaoManualMs
  while (!sinal?.aborted) {
    const restante = limite - Date.now()
    if (restante <= 0) break
    if (await verificarProntidao(Math.min(prazoRequisicaoMs, restante), sinal)) return true

    const pausa = Math.min(intervaloTentativasMs, limite - Date.now())
    if (pausa > 0 && !sinal?.aborted) await new Promise((resolver) => setTimeout(resolver, pausa))
  }
  return false
}
