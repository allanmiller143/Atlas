import { useDeferredValue, useMemo, useState } from 'react'
import { accuracyOf } from '../core/metrics.ts'
import { defaultsOf } from '../core/params.ts'
import type { Dataset, Model, ParamValues, ReadyTechnique } from '../core/types.ts'

/** Parâmetros + treino de uma técnica sobre um conjunto de pontos. */
export function usePlayground(technique: ReadyTechnique, data: Dataset) {
  const [values, setValues] = useState<ParamValues>(() => defaultsOf(technique.params))

  // Deferido: arrastar um ponto ou um slider não trava a tela enquanto o modelo treina.
  const dData = useDeferredValue(data)
  const dValues = useDeferredValue(values)

  const model: Model | null = useMemo(() => {
    try {
      return technique.fit(dData, dValues)
    } catch {
      return null
    }
  }, [technique, dData, dValues])

  const accuracy = useMemo(
    () => (model && technique.supervised ? accuracyOf(model, dData.points) : null),
    [model, technique, dData],
  )

  return {
    values,
    setValue: (key: string, v: number | string) => setValues((cur) => ({ ...cur, [key]: v })),
    reset: () => setValues(defaultsOf(technique.params)),
    model,
    accuracy,
  }
}
