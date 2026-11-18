import type { Overlay, ReadyTechnique } from '../../core/types.ts'
import { mulberry32, shuffle } from '../../core/random.ts'
import { num } from '../../core/params.ts'

// Fuzzy min-max (Simpson, 1992), versão para 2 dimensões.
// Cada hipercaixa guarda o ponto mínimo (v) e o máximo (w) e a classe.

interface Box {
  v: [number, number]
  w: [number, number]
  cls: number
}

const N = 2

/** Rampa: 0 abaixo de 0, 1 acima de 1/gamma, linear no meio. */
const ramp = (x: number, gamma: number) => {
  const t = gamma * x
  return t < 0 ? 0 : t > 1 ? 1 : t
}

/** Grau de pertinência do ponto à caixa: 1 dentro, cai com a distância. */
function membership(b: Box, x: number, y: number, gamma: number): number {
  const a = [x, y]
  let s = 0
  for (let i = 0; i < N; i++) s += 2 - ramp(a[i] - b.w[i], gamma) - ramp(b.v[i] - a[i], gamma)
  return s / (2 * N)
}

/** Se as caixas (de classes diferentes) se sobrepõem, encolhe na dimensão de menor ajuste. */
function contractIfOverlap(j: Box, k: Box): void {
  let dOld = 1
  let axis = -1
  for (let i = 0; i < N; i++) {
    const vj = j.v[i]
    const wj = j.w[i]
    const vk = k.v[i]
    const wk = k.w[i]
    let dNew: number
    if (vj < vk && vk < wj && wj < wk) dNew = Math.min(wj - vk, dOld)
    else if (vk < vj && vj < wk && wk < wj) dNew = Math.min(wk - vj, dOld)
    else if (vj < vk && vk <= wk && wk < wj) dNew = Math.min(wj - vk, wk - vj, dOld)
    else if (vk < vj && vj <= wj && wj < wk) dNew = Math.min(wj - vk, wk - vj, dOld)
    else return // sem sobreposição nesta dimensão: as caixas não se sobrepõem
    if (dOld - dNew > 0) {
      axis = i
      dOld = dNew
    }
  }
  if (axis < 0) return
  const vj = j.v[axis]
  const wj = j.w[axis]
  const vk = k.v[axis]
  const wk = k.w[axis]
  if (vj < vk && vk < wj && wj < wk) {
    j.w[axis] = k.v[axis] = (wj + vk) / 2
  } else if (vk < vj && vj < wk && wk < wj) {
    j.v[axis] = k.w[axis] = (vj + wk) / 2
  } else if (vj < vk && vk <= wk && wk < wj) {
    if (wk - vj < wj - vk) j.v[axis] = wk
    else j.w[axis] = vk
  } else if (vk < vj && vj <= wj && wj < wk) {
    if (wj - vk < wk - vj) k.v[axis] = wj
    else k.w[axis] = vj
  }
}

const technique: ReadyTechnique = {
  status: 'ready',
  id: 'hyperbox-fmm',
  name: 'Hyperbox (fuzzy min-max)',
  hierarchy: { area: 'Aprendizado de máquina', concept: 'Redes neurais', family: 'Redes neurais incrementais' },
  compareGroups: ['Classificação', 'Redes neurais'],
  summary: 'Cobre cada classe com caixas retangulares que crescem conforme chegam exemplos.',
  supervised: true,
  traits: {
    learning: ['supervised'],
    output: ['category'],
    data: ['table'],
    explainability: 2,
    minData: 'small',
  },
  params: [
    {
      key: 'theta',
      kind: 'range',
      label: 'Tamanho máximo da caixa (θ)',
      min: 0.02,
      max: 0.5,
      step: 0.01,
      default: 0.12,
      help: 'O quanto uma caixa pode crescer em cada direção. θ pequeno gera muitas caixas pequenas e acompanha bem os dados. θ grande gera poucas caixas grandes e mais simples.',
    },
    {
      key: 'gamma',
      kind: 'range',
      label: 'Sensibilidade (γ)',
      min: 1,
      max: 20,
      step: 1,
      default: 4,
      help: 'Define o quão rápido a pertinência cai ao sair da caixa. γ alto: fora da caixa a pertinência cai quase a zero logo. γ baixo: a influência da caixa se estende mais longe. Só afeta a classificação de pontos fora das caixas.',
    },
    {
      key: 'seed',
      kind: 'range',
      label: 'Ordem dos exemplos (sorteio)',
      min: 1,
      max: 20,
      step: 1,
      default: 1,
      help: 'O algoritmo vê um exemplo por vez, então a ordem muda as caixas que se formam. Trocar o sorteio mostra o quanto o resultado depende dela.',
    },
  ],
  fit(data, p) {
    const pts = data.points
    if (pts.length === 0) return { predict: () => 0 }
    const theta = num(p, 'theta')
    const gamma = num(p, 'gamma')
    const rng = mulberry32(num(p, 'seed') * 6007 + 29)

    const boxes: Box[] = []
    for (const pt of shuffle(pts, rng)) {
      const a: [number, number] = [pt.x, pt.y]
      // caixas da mesma classe, da mais pertinente para a menos
      const candidates = boxes
        .filter((b) => b.cls === pt.label)
        .map((b) => ({ b, m: membership(b, pt.x, pt.y, gamma) }))
        .sort((u, v) => v.m - u.m)
      let target: Box | null = null
      for (const { b } of candidates) {
        let size = 0
        for (let i = 0; i < N; i++) size += Math.max(b.w[i], a[i]) - Math.min(b.v[i], a[i])
        if (size <= N * theta) {
          for (let i = 0; i < N; i++) {
            b.v[i] = Math.min(b.v[i], a[i])
            b.w[i] = Math.max(b.w[i], a[i])
          }
          target = b
          break
        }
      }
      if (!target) {
        target = { v: [a[0], a[1]], w: [a[0], a[1]], cls: pt.label }
        boxes.push(target)
      }
      for (const other of boxes) if (other.cls !== target.cls) contractIfOverlap(target, other)
    }

    const overlays: Overlay[] = boxes.map((b) => ({
      kind: 'rect',
      x0: b.v[0],
      y0: b.v[1],
      x1: b.w[0],
      y1: b.w[1],
      cls: b.cls,
    }))
    return {
      predict: (x, y) => {
        let best = 0
        let bestM = -1
        for (const b of boxes) {
          const m = membership(b, x, y, gamma)
          if (m > bestM) {
            bestM = m
            best = b.cls
          }
        }
        return best
      },
      overlays,
      stats: [{ label: 'Caixas criadas', value: String(boxes.length) }],
    }
  },
  explain: {
    what: 'Cada exemplo ou entra numa caixa da sua classe, fazendo-a crescer até o tamanho máximo θ, ou cria uma caixa nova. Se uma caixa cresce e passa a invadir a de outra classe, as duas encolhem na região de sobreposição. Para classificar, a classe prevista é a da caixa com maior pertinência: 1 dentro da caixa e menor quanto mais longe. É a rede neural fuzzy min-max, proposta por Simpson em 1992.',
    use: [
      'Os exemplos chegam aos poucos e você quer aprender sem retreinar tudo: cada exemplo novo só mexe nas caixas próximas.',
      'Você quer descrever cada classe como intervalos por variável, algo que dá para ler.',
      'Os dados já estão normalizados e as classes têm regiões bem definidas.',
    ],
    avoid: [
      'Classes muito misturadas: o número de caixas cresce e o modelo vira uma lista de exemplos.',
      'A ordem dos exemplos importa e muda o resultado.',
      'Variáveis em escalas diferentes sem normalizar: a caixa fica distorcida.',
    ],
  },
  searchTerms: 'fuzzy min-max neural network hyperbox classification',
}

export default technique
