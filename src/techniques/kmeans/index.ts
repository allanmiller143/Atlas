import type { Model, Point, ReadyTechnique } from '../../core/types.ts'
import { mulberry32 } from '../../core/random.ts'
import type { Rng } from '../../core/random.ts'
import { num, str } from '../../core/params.ts'

type Center = [number, number]

const dist2 = (c: Center, x: number, y: number) => (c[0] - x) ** 2 + (c[1] - y) ** 2

function nearest(centers: Center[], x: number, y: number): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < centers.length; i++) {
    const d = dist2(centers[i], x, y)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

function initCenters(points: Point[], k: number, mode: string, rng: Rng): Center[] {
  const pick = () => points[Math.floor(rng() * points.length)]
  if (mode === 'plusplus') {
    const first = pick()
    const centers: Center[] = [[first.x, first.y]]
    while (centers.length < k) {
      const w = points.map((p) => Math.min(...centers.map((c) => dist2(c, p.x, p.y))))
      const total = w.reduce((a, b) => a + b, 0)
      if (total === 0) {
        const p = pick()
        centers.push([p.x, p.y])
        continue
      }
      let r = rng() * total
      let idx = 0
      for (; idx < w.length - 1; idx++) {
        r -= w[idx]
        if (r <= 0) break
      }
      centers.push([points[idx].x, points[idx].y])
    }
    return centers
  }
  // aleatório: k pontos distintos
  const idxs = new Set<number>()
  while (idxs.size < k) idxs.add(Math.floor(rng() * points.length))
  return [...idxs].map((i): Center => [points[i].x, points[i].y])
}

const technique: ReadyTechnique = {
  status: 'ready',
  id: 'k-means',
  name: 'K-means',
  hierarchy: { area: 'Aprendizado de máquina', concept: 'Aprendizado não supervisionado', family: 'Agrupamento' },
  compareGroups: ['Agrupamento'],
  summary: 'Divide os dados em k grupos, cada um representado por um centro.',
  supervised: false,
  traits: {
    learning: ['unsupervised'],
    output: ['groups'],
    data: ['table'],
    explainability: 3,
    minData: 'small',
  },
  params: [
    {
      key: 'k',
      kind: 'range',
      label: 'Número de grupos (k)',
      min: 2,
      max: 6,
      step: 1,
      default: 3,
      help: 'Quantos grupos o algoritmo vai formar. Ele não descobre esse número sozinho: você precisa escolher.',
    },
    {
      key: 'iterations',
      kind: 'range',
      label: 'Iterações',
      min: 1,
      max: 30,
      step: 1,
      default: 20,
      help: 'Quantas vezes repetir "atribuir pontos ao centro mais próximo" e "mover cada centro para a média". Com 1 ou 2, dá para ver o algoritmo ainda no meio do caminho.',
    },
    {
      key: 'init',
      kind: 'select',
      label: 'Posição inicial dos centros',
      options: [
        { value: 'random', label: 'Pontos sorteados' },
        { value: 'plusplus', label: 'Espalhados (k-means++)' },
      ],
      default: 'random',
      help: 'Os centros começam em algum lugar. Sorteio simples pode jogar dois centros no mesmo grupo. A opção espalhada sorteia dando mais chance a pontos longe dos centros já escolhidos.',
    },
    {
      key: 'seed',
      kind: 'range',
      label: 'Sorteio',
      min: 1,
      max: 20,
      step: 1,
      default: 1,
      help: 'Muda o sorteio da posição inicial. Se o resultado muda muito de um número para outro, o algoritmo é sensível à inicialização.',
    },
  ],
  fit(data, p): Model {
    const pts = data.points
    if (pts.length === 0) return { predict: () => 0 }
    const k = Math.min(num(p, 'k'), pts.length)
    const rng = mulberry32(num(p, 'seed') * 7919 + 13)
    let centers = initCenters(pts, k, str(p, 'init'), rng)
    let assign = new Array<number>(pts.length).fill(-1)
    let used = 0
    for (let it = 0; it < num(p, 'iterations'); it++) {
      used++
      const next = pts.map((pt) => nearest(centers, pt.x, pt.y))
      const changed = next.some((a, i) => a !== assign[i])
      assign = next
      centers = centers.map((c, ci): Center => {
        const members = pts.filter((_, i) => assign[i] === ci)
        if (members.length === 0) return c
        return [
          members.reduce((s, m) => s + m.x, 0) / members.length,
          members.reduce((s, m) => s + m.y, 0) / members.length,
        ]
      })
      if (!changed) break
    }
    const inertia = pts.reduce((s, pt) => s + dist2(centers[nearest(centers, pt.x, pt.y)], pt.x, pt.y), 0)
    return {
      predict: (x, y) => nearest(centers, x, y),
      overlays: centers.map((c, i) => ({ kind: 'dot' as const, x: c[0], y: c[1], cls: i })),
      stats: [
        { label: 'Iterações usadas', value: String(used) },
        { label: 'Soma das distâncias² aos centros', value: inertia.toFixed(3) },
      ],
    }
  },
  explain: {
    what: 'Repete duas etapas. Primeiro, cada ponto vai para o centro mais próximo. Depois, cada centro se move para a média dos pontos que recebeu. Para quando os centros deixam de mudar. Não usa rótulos: os grupos saem só da distância entre os pontos.',
    use: [
      'Você não tem rótulos e quer descobrir grupos.',
      'Os grupos são compactos, mais ou menos redondos e de tamanho parecido.',
      'Você tem muitos dados: é rápido e fácil de explicar (cada grupo é um centro).',
    ],
    avoid: [
      'Grupos alongados ou curvos. Teste com "Luas" ou "Círculos" no playground.',
      'Você não faz ideia do k e não vai comparar valores diferentes.',
      'As variáveis têm escalas muito diferentes e não foram normalizadas.',
    ],
  },
  searchTerms: 'k-means clustering',
}

export default technique
