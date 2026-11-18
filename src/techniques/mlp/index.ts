import type { ReadyTechnique } from '../../core/types.ts'
import { gaussian, mulberry32 } from '../../core/random.ts'
import { num, str } from '../../core/params.ts'

const technique: ReadyTechnique = {
  status: 'ready',
  id: 'rede-neural-mlp',
  name: 'Rede neural (MLP)',
  hierarchy: { area: 'Aprendizado de máquina', concept: 'Redes neurais', family: 'Perceptrons multicamadas' },
  compareGroups: ['Classificação', 'Redes neurais'],
  summary: 'Camadas de contas simples, ajustadas aos poucos para reduzir o erro.',
  supervised: true,
  traits: {
    learning: ['supervised'],
    output: ['category', 'number'],
    data: ['table'],
    explainability: 1,
    minData: 'large',
  },
  params: [
    {
      key: 'layers',
      kind: 'range',
      label: 'Camadas escondidas',
      min: 1,
      max: 3,
      step: 1,
      default: 2,
      help: 'Quantas camadas existem entre a entrada e a saída. Mais camadas permitem fronteiras mais complexas, mas são mais difíceis de treinar.',
    },
    {
      key: 'units',
      kind: 'range',
      label: 'Unidades por camada',
      min: 2,
      max: 16,
      step: 1,
      default: 8,
      help: 'Quantas contas cada camada faz em paralelo. Mais unidades dão mais flexibilidade (e mais risco de decorar o ruído).',
    },
    {
      key: 'activation',
      kind: 'select',
      label: 'Função de ativação',
      options: [
        { value: 'tanh', label: 'tanh (curva suave)' },
        { value: 'relu', label: 'ReLU (reta com dobra)' },
      ],
      default: 'tanh',
      help: 'A não linearidade aplicada ao fim de cada camada. Sem ela, várias camadas valeriam o mesmo que uma só e a fronteira seria sempre uma reta.',
    },
    {
      key: 'lr',
      kind: 'range',
      label: 'Taxa de aprendizado',
      min: 0.005,
      max: 0.2,
      step: 0.005,
      default: 0.05,
      help: 'O tamanho de cada passo de ajuste dos pesos. Muito pequena: aprende devagar. Muito grande: oscila e não assenta.',
    },
    {
      key: 'epochs',
      kind: 'range',
      label: 'Épocas',
      min: 20,
      max: 600,
      step: 20,
      default: 300,
      help: 'Quantas vezes o treino passa por todos os pontos. Poucas épocas deixam o modelo sem tempo de aprender. Muitas podem fazê-lo decorar os dados.',
    },
    {
      key: 'seed',
      kind: 'range',
      label: 'Sorteio dos pesos iniciais',
      min: 1,
      max: 20,
      step: 1,
      default: 1,
      help: 'Os pesos começam aleatórios. Trocar o sorteio mostra o quanto o resultado depende do ponto de partida.',
    },
  ],
  fit(data, p) {
    const pts = data.points
    if (pts.length === 0) return { predict: () => 0 }

    const layers = num(p, 'layers')
    const units = num(p, 'units')
    const epochs = num(p, 'epochs')
    const lr = num(p, 'lr')
    const relu = str(p, 'activation') === 'relu'
    const rng = mulberry32(num(p, 'seed') * 104729 + 3)

    const sizes = [2, ...new Array<number>(layers).fill(units), data.classes]
    const nl = sizes.length - 1 // número de camadas com pesos

    const W: Float64Array[] = []
    const B: Float64Array[] = []
    const mW: Float64Array[] = []
    const vW: Float64Array[] = []
    const mB: Float64Array[] = []
    const vB: Float64Array[] = []
    const gW: Float64Array[] = []
    const gB: Float64Array[] = []
    let paramCount = 0
    for (let l = 0; l < nl; l++) {
      const fin = sizes[l]
      const fout = sizes[l + 1]
      const scale = Math.sqrt((relu ? 2 : 1) / fin)
      W.push(Float64Array.from({ length: fin * fout }, () => gaussian(rng) * scale))
      B.push(new Float64Array(fout))
      mW.push(new Float64Array(fin * fout))
      vW.push(new Float64Array(fin * fout))
      mB.push(new Float64Array(fout))
      vB.push(new Float64Array(fout))
      gW.push(new Float64Array(fin * fout))
      gB.push(new Float64Array(fout))
      paramCount += fin * fout + fout
    }

    const act = (z: number) => (relu ? (z > 0 ? z : 0) : Math.tanh(z))
    const actGrad = (a: number) => (relu ? (a > 0 ? 1 : 0) : 1 - a * a)

    // a[l] = saída da camada l (a[0] = entrada). A última guarda as probabilidades.
    const makeActs = () => sizes.map((s) => new Float64Array(s))
    const forward = (a: Float64Array[], x: number, y: number) => {
      a[0][0] = (x - 0.5) * 2
      a[0][1] = (y - 0.5) * 2
      for (let l = 0; l < nl; l++) {
        const fin = sizes[l]
        const fout = sizes[l + 1]
        const last = l === nl - 1
        for (let j = 0; j < fout; j++) {
          let z = B[l][j]
          for (let i = 0; i < fin; i++) z += W[l][j * fin + i] * a[l][i]
          a[l + 1][j] = last ? z : act(z)
        }
      }
      // softmax na saída
      const out = a[nl]
      let max = -Infinity
      for (const v of out) if (v > max) max = v
      let sum = 0
      for (let j = 0; j < out.length; j++) {
        out[j] = Math.exp(out[j] - max)
        sum += out[j]
      }
      for (let j = 0; j < out.length; j++) out[j] /= sum
    }

    const acts = makeActs()
    const deltas = sizes.slice(1).map((s) => new Float64Array(s))
    const n = pts.length
    const b1 = 0.9
    const b2 = 0.999
    let finalLoss = 0

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let l = 0; l < nl; l++) {
        gW[l].fill(0)
        gB[l].fill(0)
      }
      let loss = 0
      for (const pt of pts) {
        forward(acts, pt.x, pt.y)
        loss -= Math.log(Math.max(acts[nl][pt.label], 1e-12))
        // erro na saída: probabilidade prevista menos a resposta certa
        for (let j = 0; j < sizes[nl]; j++) deltas[nl - 1][j] = acts[nl][j] - (j === pt.label ? 1 : 0)
        for (let l = nl - 1; l >= 0; l--) {
          const fin = sizes[l]
          const fout = sizes[l + 1]
          for (let j = 0; j < fout; j++) {
            const d = deltas[l][j]
            gB[l][j] += d
            for (let i = 0; i < fin; i++) gW[l][j * fin + i] += d * acts[l][i]
          }
          if (l > 0) {
            for (let i = 0; i < fin; i++) {
              let s = 0
              for (let j = 0; j < fout; j++) s += W[l][j * fin + i] * deltas[l][j]
              deltas[l - 1][i] = s * actGrad(acts[l][i])
            }
          }
        }
      }
      finalLoss = loss / n

      // passo de ajuste (Adam)
      const t = epoch + 1
      const c1 = 1 - Math.pow(b1, t)
      const c2 = 1 - Math.pow(b2, t)
      for (let l = 0; l < nl; l++) {
        for (let k = 0; k < W[l].length; k++) {
          const g = gW[l][k] / n
          mW[l][k] = b1 * mW[l][k] + (1 - b1) * g
          vW[l][k] = b2 * vW[l][k] + (1 - b2) * g * g
          W[l][k] -= (lr * (mW[l][k] / c1)) / (Math.sqrt(vW[l][k] / c2) + 1e-8)
        }
        for (let k = 0; k < B[l].length; k++) {
          const g = gB[l][k] / n
          mB[l][k] = b1 * mB[l][k] + (1 - b1) * g
          vB[l][k] = b2 * vB[l][k] + (1 - b2) * g * g
          B[l][k] -= (lr * (mB[l][k] / c1)) / (Math.sqrt(vB[l][k] / c2) + 1e-8)
        }
      }
    }

    const tmp = makeActs()
    return {
      predict: (x, y) => {
        forward(tmp, x, y)
        let best = 0
        for (let j = 1; j < tmp[nl].length; j++) if (tmp[nl][j] > tmp[nl][best]) best = j
        return best
      },
      stats: [
        { label: 'Erro final (entropia cruzada)', value: finalLoss.toFixed(3) },
        { label: 'Pesos ajustáveis', value: String(paramCount) },
      ],
    }
  },
  explain: {
    what: 'A entrada passa por uma sequência de camadas. Cada camada faz somas ponderadas das suas entradas e aplica uma função não linear. Os pesos começam aleatórios; a cada época, o treino mede o erro nos exemplos e ajusta todos os pesos um pouco na direção que o reduz.',
    use: [
      'A fronteira entre as classes é curva ou complexa.',
      'Você tem muitos exemplos.',
      'É a base de arquiteturas especializadas para imagem, texto e séries temporais.',
    ],
    avoid: [
      'Poucos dados: ela decora com facilidade.',
      'Você precisa justificar cada decisão: os pesos não têm leitura direta.',
      'Dados em tabela simples: uma random forest costuma empatar com menos ajuste.',
    ],
  },
  searchTerms: 'multilayer perceptron neural network classification',
}

export default technique
