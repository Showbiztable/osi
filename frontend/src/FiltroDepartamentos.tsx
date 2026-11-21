import type { Departamento } from './departamentos'

type FiltroDepartamentosProps = {
  departamentos: Departamento[]
  selecionados: number[]
  desabilitado: boolean
  aoAlterar: (departamentoId: number, selecionado: boolean) => void
}

export function FiltroDepartamentos({
  departamentos,
  selecionados,
  desabilitado,
  aoAlterar,
}: FiltroDepartamentosProps) {
  return (
    <fieldset className="filtro-departamentos" disabled={desabilitado}>
      <legend>Departamentos responsáveis</legend>
      {!selecionados.length && <p>Todos os departamentos</p>}
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
    </fieldset>
  )
}
