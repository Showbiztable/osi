import { requisitarComSessao } from '../acesso/acesso'

export type Departamento = {
  id: number
  nome: string
}

export class ErroCadastroDepartamento extends Error {}

export async function listarDepartamentos(): Promise<Departamento[]> {
  const resposta = await requisitarComSessao('/api/departamentos')
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os departamentos.')
  }

  return resposta.json()
}

export async function cadastrarDepartamento(nome: string): Promise<Departamento> {
  const resposta = await requisitarComSessao('/api/departamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  })

  if (resposta.status === 400) {
    throw new ErroCadastroDepartamento('Informe o nome do departamento.')
  }
  if (resposta.status === 409) {
    throw new ErroCadastroDepartamento('Já existe um departamento com esse nome.')
  }
  if (!resposta.ok) {
    throw new Error('Não foi possível cadastrar o departamento.')
  }

  return resposta.json()
}
