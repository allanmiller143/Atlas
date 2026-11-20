import type { FruitExample } from '../decision-tree/fruitExamples.ts'

/** Rede pequena (5 entradas, 2 neurônios ocultos e uma saída), só para a aula geral. */
export type NetworkWeights = {
  inputHidden: number[][]
  hiddenBias: number[]
  hiddenOutput: number[]
  outputBias: number
}

export const inputNames = ['Vermelha', 'Esverdeada', 'Alaranjada', 'Amarelada', 'Casca lisa'] as const

/** One-hot: nenhuma cor é tratada como maior ou menor do que outra. */
export function encodeFruit(f: FruitExample): number[] {
  return [
    Number(f.color === 'Vermelha'),
    Number(f.color === 'Esverdeada'),
    Number(f.color === 'Alaranjada'),
    Number(f.color === 'Amarelada'),
    Number(f.skin === 'Lisa'),
  ]
}

export const startWeights: NetworkWeights = {
  inputHidden: [
    [0.48, -0.08, -0.25, 0.03, 0.42],
    [-0.24, 0.12, 0.5, 0.3, -0.36],
  ],
  hiddenBias: [-0.05, 0.1],
  hiddenOutput: [0.65, -0.72],
  outputBias: 0.1,
}

const sigmoid = (n: number) => 1 / (1 + Math.exp(-n))
const clamp = (p: number) => Math.max(1e-8, Math.min(1 - 1e-8, p))

export function predict(w: NetworkWeights, f: FruitExample) {
  const inputs = encodeFruit(f)
  const hidden = w.inputHidden.map((row, j) => sigmoid(row.reduce((sum, wi, i) => sum + wi * inputs[i], w.hiddenBias[j])))
  const rawOutput = hidden.reduce((sum, a, j) => sum + a * w.hiddenOutput[j], w.outputBias)
  return { inputs, hidden, probability: sigmoid(rawOutput), rawOutput }
}

export function averageLoss(w: NetworkWeights, examples: FruitExample[]) {
  if (!examples.length) return 0
  return examples.reduce((sum, f) => {
    const y = Number(f.label === 'Maçã')
    const p = clamp(predict(w, f).probability)
    return sum - y * Math.log(p) - (1 - y) * Math.log(1 - p)
  }, 0) / examples.length
}

/** Uma época de SGD com retropropagação: cada exemplo do treino ajusta os pesos. */
export function trainEpoch(w: NetworkWeights, examples: FruitExample[], rate: number): NetworkWeights {
  const next: NetworkWeights = {
    inputHidden: w.inputHidden.map(row => [...row]),
    hiddenBias: [...w.hiddenBias],
    hiddenOutput: [...w.hiddenOutput],
    outputBias: w.outputBias,
  }
  for (const fruit of examples) {
    const { inputs, hidden, probability } = predict(next, fruit)
    const outputDelta = probability - Number(fruit.label === 'Maçã')
    const previousOutputWeights = [...next.hiddenOutput]
    for (let j = 0; j < next.hiddenOutput.length; j++) {
      next.hiddenOutput[j] -= rate * outputDelta * hidden[j]
    }
    next.outputBias -= rate * outputDelta
    for (let j = 0; j < next.inputHidden.length; j++) {
      const delta = outputDelta * previousOutputWeights[j] * hidden[j] * (1 - hidden[j])
      for (let i = 0; i < inputs.length; i++) {
        next.inputHidden[j][i] -= rate * delta * inputs[i]
      }
      next.hiddenBias[j] -= rate * delta
    }
  }
  return next
}

/** Um clique executa algumas épocas para a mudança ficar perceptível no exemplo. */
export function trainBlock(w: NetworkWeights, examples: FruitExample[], rate: number, epochs = 10) {
  let next = w
  for (let i = 0; i < epochs; i++) next = trainEpoch(next, examples, rate)
  return next
}
