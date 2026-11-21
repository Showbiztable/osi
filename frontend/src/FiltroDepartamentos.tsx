import { useId, useState } from 'react'
import type { Departamento } from './departamentos'
import './FiltroDepartamentos.css'

type FiltroDepartamentosProps = {
  departamentos: Departamento[]
  selecionados: number[]
  desabilitado: boolean
  aoAlterar: (departamentoId: number, selecionado: boolean) => void
  aoLimpar: () => void
}

export function FiltroDepartamentos({
  departamentos,
  selecionados,
  desabilitado,
  aoAlterar,
  aoLimpar,
}: FiltroDepartamentosProps) {
  const [aberto, setAberto] = useState(false)
  const idOpcoes = useId()
  const departamentosSelecionados = departamentos.filter(({ id }) => selecionados.includes(id))

  return (
    <div className="filtro-controle">
      <button
        type="button"
        className="botao-secundario"
        aria-expanded={aberto}
        aria-controls={idOpcoes}
        onClick={() => setAberto((atual) => !atual)}
      >
        Filtro
      </button>
      <fieldset
        id={idOpcoes}
        className="filtro-departamentos"
        aria-label="Departamentos responsáveis"
        disabled={desabilitado}
        hidden={!aberto}
      >
        <div className="opcoes-departamentos">
          {departamentos.map(({ id, nome }) => (
            <label key={id}>
              <input
                type="checkbox"
                checked={selecionados.includes(id)}
                onChange={(evento) => aoAlterar(id, evento.currentTarget.checked)}
              />
              {nome}
            </label>
          ))}
        </div>
        <button type="button" className="botao-secundario" onClick={aoLimpar}>
          Limpar filtros
        </button>
      </fieldset>
      {departamentosSelecionados.length > 0 && (
        <ul className="filtros-selecionados" aria-label="Departamentos selecionados" role="list">
          {departamentosSelecionados.map(({ id, nome }) => <li key={id}>{nome}</li>)}
        </ul>
      )}
    </div>
  )
}
