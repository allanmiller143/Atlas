import type { ReadyTechnique } from '../../core/types.ts'
import { mulberry32 } from '../../core/random.ts'
import { num } from '../../core/params.ts'
import { buildTree, predictTree } from '../../core/tree.ts'
import type { TreeNode } from '../../core/tree.ts'

const technique: ReadyTechnique = {
  status: 'ready',
  id: 'random-forest',
  name: 'Random Forest',
  hierarchy: { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Modelos baseados em árvores' },
  compareGroups: ['Classificação', 'Modelos baseados em árvores'],
  summary: 'Treina várias árvores diferentes e decide por votação.',
  supervised: true,
  traits: {
    learning: ['supervised'],
    output: ['category', 'number'],
    data: ['table'],
    explainability: 2,
    minData: 'small',
  },
  params: [
    {
      key: 'nTrees',
      kind: 'range',
      label: 'n_estimators',
      min: 1,
      max: 100,
      step: 1,
      default: 25,
      help: 'Quantas árvores votam. Com 1 você tem uma árvore só, com bordas irregulares. Com mais árvores, a votação suaviza as bordas. Depois de algumas dezenas, o ganho é pequeno.',
    },
    {
      key: 'maxDepth',
      kind: 'range',
      label: 'max_depth',
      min: 1,
      max: 12,
      step: 1,
      default: 6,
      help: 'Mesma ideia da árvore de decisão: quantas perguntas em sequência cada árvore pode fazer.',
    },
    {
      key: 'mtry',
      kind: 'range',
      label: 'max_features',
      min: 1,
      max: 2,
      step: 1,
      default: 1,
      help: 'Em cada pergunta, a árvore só pode escolher entre essa quantidade de variáveis, sorteadas. Aqui existem 2 variáveis (x e y). Com 1, as árvores ficam mais diferentes entre si.',
    },
    {
      key: 'seed',
      kind: 'range',
      label: 'random_state',
      min: 1,
      max: 20,
      step: 1,
      default: 1,
      help: 'Muda os sorteios das amostras e das variáveis. Serve para ver o quanto o resultado depende da sorte.',
    },
  ],
  fit(data, p) {
    const pts = data.points
    if (pts.length === 0) return { predict: () => 0 }
    const rng = mulberry32(num(p, 'seed') * 7919 + 101)
    const trees: TreeNode[] = []
    for (let t = 0; t < num(p, 'nTrees'); t++) {
      // amostra com reposição do mesmo tamanho dos dados (bootstrap)
      const sample = pts.map(() => pts[Math.floor(rng() * pts.length)])
      trees.push(
        buildTree(sample, {
          maxDepth: num(p, 'maxDepth'),
          minSamples: 2,
          classes: data.classes,
          mtry: num(p, 'mtry'),
          rng,
        }),
      )
    }
    return {
      predict: (x, y) => {
        const votes = new Array<number>(data.classes).fill(0)
        for (const tree of trees) votes[predictTree(tree, x, y)]++
        let best = 0
        for (let c = 1; c < votes.length; c++) if (votes[c] > votes[best]) best = c
        return best
      },
      stats: [{ label: 'Árvores votando', value: String(trees.length) }],
    }
  },
  explain: {
    what: 'Cada árvore treina com uma amostra sorteada dos dados (com repetição) e, em cada pergunta, só pode usar algumas variáveis sorteadas. Isso faz as árvores errarem em lugares diferentes. A resposta final é a classe mais votada entre todas.',
    use: [
      'Dados em tabela e você quer um bom resultado sem ajustar muita coisa.',
      'Uma árvore sozinha está decorando o ruído: a votação reduz isso.',
      'Você tem variáveis de tipos misturados e não quer normalizar.',
    ],
    avoid: [
      'Você precisa ler a decisão passo a passo: com dezenas de árvores isso não é possível.',
      'A fronteira é curva ou diagonal: ela continua feita de blocos retangulares.',
      'Dados brutos de imagem ou texto, onde as variáveis não são colunas com significado.',
    ],
  },
  searchTerms: 'random forest classification',
}

export default technique
