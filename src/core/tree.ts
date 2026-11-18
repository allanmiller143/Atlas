import type { Point } from './types.ts'
import type { Rng } from './random.ts'

export type TreeNode =
  | { leaf: true; label: number }
  | { leaf: false; axis: 0 | 1; thr: number; left: TreeNode; right: TreeNode }

export interface TreeOptions {
  maxDepth: number
  /** Mínimo de pontos num nó para ele poder ser dividido. */
  minSamples: number
  classes: number
  /** Quantas variáveis (de 2) cada divisão pode considerar. Usado pela floresta. */
  mtry?: number
  rng?: Rng
}

const coord = (p: Point, axis: 0 | 1) => (axis === 0 ? p.x : p.y)

function majority(points: Point[], classes: number): number {
  const counts = new Array<number>(classes).fill(0)
  for (const p of points) counts[p.label]++
  let best = 0
  for (let c = 1; c < classes; c++) if (counts[c] > counts[best]) best = c
  return best
}

function gini(counts: number[], total: number): number {
  if (total === 0) return 0
  let s = 0
  for (const c of counts) s += (c / total) ** 2
  return 1 - s
}

function bestSplitOnAxis(points: Point[], axis: 0 | 1, classes: number) {
  const sorted = points.slice().sort((a, b) => coord(a, axis) - coord(b, axis))
  const n = sorted.length
  const left = new Array<number>(classes).fill(0)
  const right = new Array<number>(classes).fill(0)
  for (const p of sorted) right[p.label]++
  let best: { axis: 0 | 1; thr: number; score: number } | null = null
  for (let i = 0; i < n - 1; i++) {
    const c = sorted[i].label
    left[c]++
    right[c]--
    const v = coord(sorted[i], axis)
    const nv = coord(sorted[i + 1], axis)
    if (v === nv) continue
    const nl = i + 1
    const score = (nl * gini(left, nl) + (n - nl) * gini(right, n - nl)) / n
    if (!best || score < best.score) best = { axis, thr: (v + nv) / 2, score }
  }
  return best
}

function bestSplit(points: Point[], opts: TreeOptions) {
  let axes: (0 | 1)[] = [0, 1]
  const restricted = opts.mtry !== undefined && opts.mtry < 2 && opts.rng
  if (restricted && opts.rng && opts.rng() < 0.5) axes = [1, 0]
  let best: { axis: 0 | 1; thr: number; score: number } | null = null
  for (const axis of axes) {
    const cand = bestSplitOnAxis(points, axis, opts.classes)
    if (cand && (!best || cand.score < best.score)) best = cand
    // com uma única variável por divisão, só tenta a outra se a primeira não serviu
    if (restricted && best) break
  }
  return best
}

export function buildTree(points: Point[], opts: TreeOptions, depth = 0): TreeNode {
  if (points.length === 0) return { leaf: true, label: 0 }
  const label = majority(points, opts.classes)
  const pure = points.every((p) => p.label === points[0].label)
  if (pure || depth >= opts.maxDepth || points.length < opts.minSamples) {
    return { leaf: true, label }
  }
  const split = bestSplit(points, opts)
  if (!split) return { leaf: true, label }
  const left = points.filter((p) => coord(p, split.axis) <= split.thr)
  const right = points.filter((p) => coord(p, split.axis) > split.thr)
  if (left.length === 0 || right.length === 0) return { leaf: true, label }
  return {
    leaf: false,
    axis: split.axis,
    thr: split.thr,
    left: buildTree(left, opts, depth + 1),
    right: buildTree(right, opts, depth + 1),
  }
}

export function predictTree(node: TreeNode, x: number, y: number): number {
  let cur = node
  while (!cur.leaf) cur = (cur.axis === 0 ? x : y) <= cur.thr ? cur.left : cur.right
  return cur.label
}

export function depthOf(node: TreeNode): number {
  return node.leaf ? 0 : 1 + Math.max(depthOf(node.left), depthOf(node.right))
}

export function leavesOf(node: TreeNode): number {
  return node.leaf ? 1 : leavesOf(node.left) + leavesOf(node.right)
}
