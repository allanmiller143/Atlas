import type { ReadyTechnique } from '../../core/types.ts'
import { num } from '../../core/params.ts'
import { buildTree, depthOf, leavesOf, predictTree } from '../../core/tree.ts'

const technique: ReadyTechnique = {
  status: 'ready',
  id: 'arvore-de-decisao',
  name: 'Decision Tree',
  hierarchy: { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Modelos baseados em árvores' },
  compareGroups: ['Classificação', 'Modelos baseados em árvores'],
  summary: 'Faz perguntas do tipo "x é maior que 0,4?" até chegar a uma resposta.',
  supervised: true,
  traits: {
    learning: ['supervised'],
    output: ['category', 'number'],
    data: ['table'],
    explainability: 3,
    minData: 'small',
  },
  params: [
    {
      key: 'maxDepth',
      kind: 'range',
      label: 'max_depth',
      min: 1,
      max: 12,
      step: 1,
      default: 3,
      help: 'Quantas perguntas em sequência a árvore pode fazer. Pouca profundidade simplifica demais. Muita faz a árvore decorar até o ruído dos dados de treino.',
    },
    {
      key: 'minSamples',
      kind: 'range',
      label: 'min_samples_split',
      min: 2,
      max: 30,
      step: 1,
      default: 2,
      help: 'Um grupo com menos pontos que isso não é mais dividido. Valores maiores deixam a árvore mais simples e menos sensível a pontos isolados.',
    },
  ],
  fit(data, p) {
    if (data.points.length === 0) return { predict: () => 0 }
    const tree = buildTree(data.points, {
      maxDepth: num(p, 'maxDepth'),
      minSamples: num(p, 'minSamples'),
      classes: data.classes,
    })
    return {
      predict: (x, y) => predictTree(tree, x, y),
      stats: [
        { label: 'Profundidade usada', value: String(depthOf(tree)) },
        { label: 'Respostas finais (folhas)', value: String(leavesOf(tree)) },
      ],
    }
  },
  explain: {
    what: 'Em cada passo, testa várias perguntas simples sobre uma variável por vez e escolhe a que deixa os dois lados mais "puros", ou seja, com pontos de uma classe só. Repete dentro de cada lado. O resultado é um caminho de perguntas que termina em uma resposta.',
    use: [
      'Você precisa mostrar por que o modelo decidiu algo: dá para ler o caminho de perguntas.',
      'Seus dados são uma tabela, com variáveis de tipos misturados.',
      'Você tem poucos dados e quer um primeiro modelo rápido.',
    ],
    avoid: [
      'A fronteira entre as classes é diagonal ou curva: a árvore a aproxima com degraus.',
      'Profundidade alta com poucos dados: ela decora o ruído.',
      'Pequenas mudanças nos dados podem gerar uma árvore bem diferente.',
    ],
  },
  searchTerms: 'decision tree CART classification',
}

export default technique
