import type { Dataset, Point } from './types.ts'
import { gaussian, mulberry32 } from './random.ts'

export type PresetId = 'moons' | 'circles' | 'blobs' | 'xor'

export const PRESETS: { id: PresetId; label: string; classes: number }[] = [
  { id: 'moons', label: 'Luas', classes: 2 },
  { id: 'circles', label: 'Círculos', classes: 2 },
  { id: 'blobs', label: 'Grupos', classes: 3 },
  { id: 'xor', label: 'XOR', classes: 2 },
]

const clamp01 = (v: number) => Math.min(0.99, Math.max(0.01, v))

/** Reescala uniformemente para caber em [0.06, 0.94], preservando a forma. */
function fitToUnit(points: Point[]): Point[] {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scale = 0.88 / Math.max(maxX - minX, maxY - minY, 1e-9)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return points.map((p) => ({
    ...p,
    x: clamp01(0.5 + (p.x - cx) * scale),
    y: clamp01(0.5 + (p.y - cy) * scale),
  }))
}

export function generate(preset: PresetId, n: number, noise: number, seed: number): Dataset {
  const rng = mulberry32(seed * 2654435761)
  const points: Point[] = []

  if (preset === 'moons') {
    for (let i = 0; i < n; i++) {
      const label = i % 2
      const t = Math.PI * rng()
      const x = label === 0 ? Math.cos(t) : 1 - Math.cos(t)
      const y = label === 0 ? Math.sin(t) : 0.5 - Math.sin(t)
      points.push({
        x: x + gaussian(rng) * noise * 0.25,
        y: y + gaussian(rng) * noise * 0.25,
        label,
      })
    }
    return { points: fitToUnit(points), classes: 2 }
  }

  if (preset === 'circles') {
    for (let i = 0; i < n; i++) {
      const label = i % 2
      const r = label === 0 ? 1 : 0.45
      const a = 2 * Math.PI * rng()
      points.push({
        x: r * Math.cos(a) + gaussian(rng) * noise * 0.2,
        y: r * Math.sin(a) + gaussian(rng) * noise * 0.2,
        label,
      })
    }
    return { points: fitToUnit(points), classes: 2 }
  }

  if (preset === 'blobs') {
    const centers = [
      [0.25, 0.28],
      [0.75, 0.3],
      [0.5, 0.75],
    ]
    const sd = 0.05 + noise * 0.12
    for (let i = 0; i < n; i++) {
      const label = i % 3
      points.push({
        x: clamp01(centers[label][0] + gaussian(rng) * sd),
        y: clamp01(centers[label][1] + gaussian(rng) * sd),
        label,
      })
    }
    return { points, classes: 3 }
  }

  // xor
  const centers = [
    { c: [0.25, 0.25], label: 0 },
    { c: [0.75, 0.75], label: 0 },
    { c: [0.25, 0.75], label: 1 },
    { c: [0.75, 0.25], label: 1 },
  ]
  const sd = 0.06 + noise * 0.1
  for (let i = 0; i < n; i++) {
    const k = centers[i % 4]
    points.push({
      x: clamp01(k.c[0] + gaussian(rng) * sd),
      y: clamp01(k.c[1] + gaussian(rng) * sd),
      label: k.label,
    })
  }
  return { points, classes: 2 }
}
