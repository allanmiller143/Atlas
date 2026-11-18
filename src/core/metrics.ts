import type { Model, Point } from './types.ts'

/** Fração de pontos em que a previsão bate com a classe real. */
export function accuracyOf(model: Model, points: Point[]): number {
  if (points.length === 0) return 0
  let hits = 0
  for (const p of points) if (model.predict(p.x, p.y) === p.label) hits++
  return hits / points.length
}
