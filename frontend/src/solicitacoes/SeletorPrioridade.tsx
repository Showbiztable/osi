import type { ComponentProps } from 'react'
import { rotulosPrioridade } from './solicitacoes'
import './SeletorPrioridade.css'

type SeletorPrioridadeProps = Omit<ComponentProps<'select'>, 'children' | 'className'> & {
  rotuloVazio?: string
}

export function SeletorPrioridade({ rotuloVazio, ...props }: SeletorPrioridadeProps) {
  return (
    <select {...props} className="seletor-prioridade">
      {rotuloVazio && <option value="" disabled>{rotuloVazio}</option>}
      {Object.entries(rotulosPrioridade).map(([valor, rotulo]) => (
        <option key={valor} value={valor} data-prioridade={valor}>{rotulo}</option>
      ))}
    </select>
  )
}
