export async function entrarNaDemo(codigo: string): Promise<void> {
  const resposta = await fetch('/api/acesso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  })

  if (resposta.status !== 204) {
    throw new Error('Não foi possível entrar na demo.')
  }
}
