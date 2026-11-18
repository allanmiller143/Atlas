import type { ReadyTechnique, Technique } from '../core/types.ts'
import { PLANNED } from './planned.ts'

// Toda pasta src/techniques/<id>/index.ts com `export default` de uma técnica
// entra no catálogo sozinha. Não existe lista para editar.
const modules = import.meta.glob<{ default: ReadyTechnique }>('./*/index.ts', { eager: true })

export const READY: ReadyTechnique[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.name.localeCompare(b.name, 'pt'))

export const ALL: Technique[] = [
  ...READY,
  ...PLANNED.filter((p) => !READY.some((r) => r.id === p.id)),
]

export const byId = (id: string | undefined): Technique | undefined => ALL.find((t) => t.id === id)

export const readyById = (id: string | undefined): ReadyTechnique | undefined =>
  READY.find((t) => t.id === id)
