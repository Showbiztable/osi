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
  const quantidadeSelecionada = selecionados.length

  return (
    <details className="filtro-controle">
      <summary>
        Filtro
        {quantidadeSelecionada > 0 && (
          <span className="filtro-contagem">
            {' '}({quantidadeSelecionada} {quantidadeSelecionada === 1 ? 'selecionado' : 'selecionados'})
          </span>
        )}
      </summary>
      <fieldset className="filtro-departamentos" disabled={desabilitado}>
        <legend>Departamentos responsáveis</legend>
        {quantidadeSelecionada === 0 && <p>Todos os departamentos</p>}
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
    </details>
  )
}
