import { useCallback, useMemo, useState } from 'react'
import { generate } from '../core/datasets.ts'
import type { PresetId } from '../core/datasets.ts'
import type { Dataset, Point } from '../core/types.ts'

interface Config {
  preset: PresetId
  n: number
  noise: number
  seed: number
}

/**
 * Conjunto de pontos do playground.
 * Vem de um gerador (preset + ruído + sorteio) até o usuário mexer em um ponto;
 * a partir daí vira "personalizado" e só volta ao gerador quando ele mudar um controle.
 */
export function useDataset(initial: Partial<Config> = {}) {
  const [cfg, setCfg] = useState<Config>({ preset: 'moons', n: 160, noise: 0.25, seed: 7, ...initial })
  const [custom, setCustom] = useState<Point[] | null>(null)

  const generated = useMemo(
    () => generate(cfg.preset, cfg.n, cfg.noise, cfg.seed),
    [cfg.preset, cfg.n, cfg.noise, cfg.seed],
  )
  const data: Dataset = useMemo(
    () => (custom ? { points: custom, classes: generated.classes } : generated),
    [custom, generated],
  )

  const update = useCallback((patch: Partial<Config>) => {
    setCustom(null)
    setCfg((c) => ({ ...c, ...patch }))
  }, [])

  return {
    data,
    cfg,
    isCustom: custom !== null,
    setPreset: (preset: PresetId) => update({ preset }),
    setNoise: (noise: number) => update({ noise }),
    setN: (n: number) => update({ n }),
    reseed: () => update({ seed: cfg.seed + 1 }),
    setPoints: (points: Point[]) => setCustom(points),
  }
}

export type DatasetControls = ReturnType<typeof useDataset>
