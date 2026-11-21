import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { FilaAtendimento } from './FilaAtendimento'
import type { ItemFila } from './solicitacoes'

const departamentoResponsavelId = 20

it('destaca apenas a primeira solicitação na ordem recebida', () => {
  const itens: ItemFila[] = [
    {
      id: 42,
      descricao: 'Restaurar o acesso',
      departamentoSolicitanteId: 10,
      departamentoResponsavelId,
      prioridade: 'URGENTE',
      entrada: '2026-11-19T12:15:00Z',
    },
    {
      id: 41,
      descricao: 'Atualizar o cadastro',
      departamentoSolicitanteId: 10,
      departamentoResponsavelId,
      prioridade: 'BAIXA',
      entrada: '2026-11-19T12:00:00Z',
    },
  ]

  const pagina = renderToStaticMarkup(<FilaAtendimento itens={itens} />)
  const itensExibidos = pagina.match(/<li\b[^>]*>[\s\S]*?<\/li>/g) ?? []

  expect(itensExibidos).toHaveLength(2)
  expect(itensExibidos[0]).toContain('Restaurar o acesso')
  expect(itensExibidos[0]).toContain('Próxima solicitação')
  expect(itensExibidos[1]).toContain('Atualizar o cadastro')
  expect(itensExibidos[1]).not.toContain('Próxima solicitação')
})

it('destaca a primeira solicitação de cada departamento responsável na fila geral', () => {
  const outroDepartamentoResponsavelId = 30
  const primeira: ItemFila = {
    id: 42,
    descricao: 'Restaurar o acesso',
    departamentoSolicitanteId: 10,
    departamentoResponsavelId,
    prioridade: 'URGENTE',
    entrada: '2026-11-19T12:15:00Z',
  }
  const primeiraDoOutroDepartamento: ItemFila = {
    ...primeira,
    id: 40,
    descricao: 'Conferir os relatórios',
    departamentoResponsavelId: outroDepartamentoResponsavelId,
    prioridade: 'MEDIA',
  }
  const itens: ItemFila[] = [
    primeira,
    { ...primeira, id: 41, descricao: 'Atualizar o cadastro', prioridade: 'ALTA' },
    primeiraDoOutroDepartamento,
    { ...primeiraDoOutroDepartamento, id: 39, descricao: 'Organizar os arquivos', prioridade: 'BAIXA' },
  ]

  const pagina = renderToStaticMarkup(<FilaAtendimento itens={itens} />)
  const itensExibidos = pagina.match(/<li\b[^>]*>[\s\S]*?<\/li>/g) ?? []

  expect(itensExibidos.map((item) => item.includes('Próxima solicitação'))).toEqual([true, false, true, false])
})

it('filtra por múltiplos departamentos responsáveis e mantém a ordem da fila', () => {
  const financeiroId = 10
  const tiId = 20
  const rhId = 30
  const solicitacaoTi: ItemFila = {
    id: 42,
    descricao: 'Restaurar o acesso',
    departamentoSolicitanteId: financeiroId,
    departamentoResponsavelId: tiId,
    prioridade: 'URGENTE',
    entrada: '2026-11-19T12:15:00Z',
  }
  const solicitacaoFinanceiro: ItemFila = {
    ...solicitacaoTi,
    id: 41,
    descricao: 'Revisar os reembolsos',
    departamentoSolicitanteId: tiId,
    departamentoResponsavelId: financeiroId,
    prioridade: 'ALTA',
  }
  const solicitacaoRh: ItemFila = {
    ...solicitacaoTi,
    id: 40,
    descricao: 'Atualizar a lista de integração',
    departamentoResponsavelId: rhId,
    prioridade: 'MEDIA',
  }
  const itens = [solicitacaoTi, solicitacaoFinanceiro, solicitacaoRh]

  const pagina = renderToStaticMarkup(
    <FilaAtendimento itens={itens} departamentosResponsaveisSelecionados={[rhId, tiId]} />,
  )
  const descricoes = Array.from(pagina.matchAll(/<h3>([^<]+)<\/h3>/g), ([, descricao]) => descricao)

  expect(descricoes).toEqual([solicitacaoTi.descricao, solicitacaoRh.descricao])
})

it('distingue os departamentos no cartão e identifica a fila da próxima solicitação', () => {
  const financeiro = { id: 10, nome: 'Financeiro' }
  const ti = { id: departamentoResponsavelId, nome: 'TI' }
  const item: ItemFila = {
    id: 42,
    descricao: 'Restaurar o acesso',
    departamentoSolicitanteId: financeiro.id,
    departamentoResponsavelId: ti.id,
    prioridade: 'ALTA',
    entrada: '2026-11-19T12:15:00Z',
  }

  const pagina = renderToStaticMarkup(<FilaAtendimento itens={[item]} departamentos={[ti, financeiro]} />)

  expect(pagina).toContain('Próxima solicitação da fila de TI')
  expect(pagina).toContain('<dt>De</dt><dd>Financeiro</dd>')
  expect(pagina).toContain('<dt>Para</dt><dd>TI</dd>')
})

it('mostra as concluídas do departamento responsável selecionado mesmo sem solicitações ativas', () => {
  const financeiro = { id: 10, nome: 'Financeiro' }
  const ti = { id: departamentoResponsavelId, nome: 'TI' }
  const concluidaTi: ItemFila = {
    id: 42,
    descricao: 'Restaurar o acesso',
    departamentoSolicitanteId: financeiro.id,
    departamentoResponsavelId: ti.id,
    prioridade: 'ALTA',
    entrada: '2026-11-19T12:15:00Z',
  }
  const concluidaFinanceiro: ItemFila = {
    ...concluidaTi,
    id: 41,
    descricao: 'Revisar os reembolsos',
    departamentoSolicitanteId: ti.id,
    departamentoResponsavelId: financeiro.id,
  }

  const pagina = renderToStaticMarkup(
    <FilaAtendimento
      itens={[]}
      concluidas={[concluidaTi, concluidaFinanceiro]}
      departamentos={[financeiro, ti]}
      departamentosResponsaveisSelecionados={[ti.id]}
    />,
  )
  const coluna = pagina.match(/<section\b[^>]*aria-labelledby="titulo-concluidas"[^>]*>([\s\S]*?)<\/section>/)?.[1]

  expect(coluna, 'O quadro deve exibir a coluna Concluídas mesmo com a fila ativa vazia').toBeDefined()
  expect(coluna).toContain('>Concluídas</h2>')
  expect(coluna).toContain(concluidaTi.descricao)
  expect(coluna).toContain('>Alta</span>')
  expect(pagina).not.toContain(concluidaFinanceiro.descricao)
  expect(coluna).not.toMatch(/Próxima solicitação|Alterar prioridade|Concluir solicitação/)
})

it('oferece a alteração de prioridade com a prioridade atual selecionada', () => {
  const item: ItemFila = {
    id: 42,
    descricao: 'Restaurar o acesso',
    departamentoSolicitanteId: 10,
    departamentoResponsavelId,
    prioridade: 'ALTA',
    entrada: '2026-11-19T12:15:00Z',
  }

  const pagina = renderToStaticMarkup(<FilaAtendimento itens={[item]} />)
  const seletor = pagina.match(/<select\b[^>]*aria-label="Alterar prioridade da solicitação #42"[^>]*>[\s\S]*?<\/select>/)?.[0]

  expect(seletor, 'A solicitação deve oferecer um seletor de prioridade').toBeDefined()
  expect(seletor).toContain('<option value="ALTA" selected="">Alta</option>')
  expect(seletor).toContain('<option value="URGENTE">Urgente</option>')
})

it('oferece um botão para concluir cada solicitação da fila', () => {
  const primeira: ItemFila = {
    id: 42,
    descricao: 'Restaurar o acesso',
    departamentoSolicitanteId: 10,
    departamentoResponsavelId,
    prioridade: 'URGENTE',
    entrada: '2026-11-19T12:15:00Z',
  }
  const seguinte: ItemFila = { ...primeira, id: 41, descricao: 'Atualizar o cadastro', prioridade: 'BAIXA' }

  const pagina = renderToStaticMarkup(<FilaAtendimento itens={[primeira, seguinte]} />)
  const itensExibidos = pagina.match(/<li\b[^>]*>[\s\S]*?<\/li>/g) ?? []

  expect(itensExibidos).toHaveLength(2)
  expect(itensExibidos[0]).toMatch(/<button\b[^>]*aria-label="Concluir solicitação #42"[^>]*>Concluir<\/button>/)
  expect(itensExibidos[1]).toMatch(/<button\b[^>]*aria-label="Concluir solicitação #41"[^>]*>Concluir<\/button>/)
})
