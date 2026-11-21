import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { Notificacao } from './Notificacao'

it.each([
  ['sucesso', 'status', 'Solicitação #42 cadastrada com sucesso.'],
  ['erro', 'alert', 'Não foi possível cadastrar. Tente novamente.'],
] as const)('anuncia a notificação de %s com o papel %s', (tipo, papel, mensagem) => {
  const pagina = renderToStaticMarkup(
    <Notificacao aviso={{ tipo, mensagem }} aoDispensar={() => {}} />,
  )

  const regioes = Array.from(
    pagina.matchAll(/<p\b[^>]*role="(status|alert)"[^>]*>([^<]*)<\/p>/g),
    ([, papel, texto]) => [papel, texto],
  )
  expect(regioes).toContainEqual([papel, mensagem])
})
