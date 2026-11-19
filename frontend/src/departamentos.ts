export type Departamento = {
  id: number
  nome: string
}

export async function listarDepartamentos(): Promise<Departamento[]> {
  const resposta = await fetch('/api/departamentos')
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os departamentos.')
  }

  return resposta.json()
}
