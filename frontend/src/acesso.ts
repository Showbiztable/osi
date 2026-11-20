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

export const verificarConexao: () => Promise<boolean> = () => Promise.resolve(false)
