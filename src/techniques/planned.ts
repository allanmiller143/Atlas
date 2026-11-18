import type { PlannedTechnique, Traits } from '../core/types.ts'

// Técnicas que aparecem no catálogo mas ainda não têm demo.
// Para implementar uma: crie a pasta src/techniques/<id>/index.ts com o mesmo `id`.
// A entrada daqui é ignorada automaticamente quando a versão pronta existir.

const p = (
  id: string,
  name: string,
  family: string,
  summary: string,
  traits: Traits,
 ): PlannedTechnique => {
  const meta = hierarchy[id] ?? { area: 'Inteligência artificial', concept: family, family, compare: [] }
  return { status: 'planned', id, name, summary, traits, hierarchy: { area: meta.area, concept: meta.concept, family: meta.family }, compareGroups: meta.compare }
}

const hierarchy: Record<string, { area: string; concept: string; family: string; compare: string[] }> = {
  'regressao-linear': { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Modelos lineares', compare: ['Regressão'] },
  'regressao-logistica': { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Modelos lineares', compare: ['Classificação', 'Modelos lineares'] },
  knn: { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Métodos baseados em exemplos', compare: ['Classificação'] },
  svm: { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Métodos de margem', compare: ['Classificação'] },
  'naive-bayes': { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Modelos probabilísticos', compare: ['Classificação'] },
  'gradient-boosting': { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Ensembles de árvores', compare: ['Classificação', 'Modelos baseados em árvores'] },
  xgboost: { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Ensembles de árvores', compare: ['Classificação', 'Modelos baseados em árvores'] },
  adaboost: { area: 'Aprendizado de máquina', concept: 'Aprendizado supervisionado', family: 'Ensembles de árvores', compare: ['Classificação', 'Modelos baseados em árvores'] },
  dbscan: { area: 'Aprendizado de máquina', concept: 'Aprendizado não supervisionado', family: 'Agrupamento', compare: ['Agrupamento'] },
  som: { area: 'Aprendizado de máquina', concept: 'Redes neurais', family: 'Mapas auto-organizáveis', compare: ['Agrupamento', 'Redes neurais'] },
  pca: { area: 'Aprendizado de máquina', concept: 'Aprendizado não supervisionado', family: 'Redução de dimensionalidade', compare: ['Redução de dimensionalidade'] },
  'algoritmo-genetico': { area: 'Computação evolutiva', concept: 'Otimização inspirada na natureza', family: 'Algoritmos genéticos', compare: ['Otimização'] },
  'q-learning': { area: 'Aprendizado por reforço', concept: 'Métodos baseados em valor', family: 'Aprendizado por reforço', compare: ['Aprendizado por reforço'] },
  cnn: { area: 'Aprendizado de máquina', concept: 'Redes neurais', family: 'Redes convolucionais', compare: ['Classificação', 'Redes neurais'] },
  lstm: { area: 'Aprendizado de máquina', concept: 'Redes neurais', family: 'Redes recorrentes', compare: ['Classificação', 'Redes neurais'] },
  transformer: { area: 'Aprendizado de máquina', concept: 'Redes neurais', family: 'Transformers', compare: ['Classificação', 'Redes neurais'] },
  'gemeo-digital': { area: 'Sistemas inteligentes', concept: 'Representação de sistemas reais', family: 'Gêmeos digitais', compare: ['Sistemas inteligentes'] },
}

export const PLANNED: PlannedTechnique[] = [
  p('regressao-linear', 'Regressão linear', 'Modelos lineares', 'Ajusta uma reta (ou plano) para prever um número.', {
    learning: ['supervised'], output: ['number'], data: ['table'], explainability: 3, minData: 'small',
  }),
  p('regressao-logistica', 'Regressão logística', 'Modelos lineares', 'Estima a probabilidade de cada categoria com uma fronteira reta.', {
    learning: ['supervised'], output: ['category'], data: ['table'], explainability: 3, minData: 'small',
  }),
  p('knn', 'k vizinhos mais próximos', 'Baseados em exemplos', 'Classifica pelo voto dos k exemplos mais parecidos.', {
    learning: ['supervised'], output: ['category', 'number'], data: ['table'], explainability: 2, minData: 'small',
  }),
  p('svm', 'Máquina de vetores de suporte', 'Margem máxima', 'Procura a fronteira com a maior folga entre as classes.', {
    learning: ['supervised'], output: ['category'], data: ['table'], explainability: 2, minData: 'small',
  }),
  p('naive-bayes', 'Naive Bayes', 'Probabilísticos', 'Combina probabilidades de cada variável, supondo que são independentes.', {
    learning: ['supervised'], output: ['category'], data: ['table', 'text'], explainability: 3, minData: 'small',
  }),
  p('gradient-boosting', 'Gradient boosting', 'Árvores', 'Árvores pequenas em sequência, cada uma corrigindo o erro da anterior.', {
    learning: ['supervised'], output: ['category', 'number'], data: ['table'], explainability: 2, minData: 'small',
  }),
  p('xgboost', 'XGBoost', 'Ensembles de árvores', 'Gradient boosting com otimizações e regularização, muito usado em dados tabulares.', { learning: ['supervised'], output: ['category', 'number'], data: ['table'], explainability: 2, minData: 'small' }),
  p('adaboost', 'AdaBoost', 'Ensembles de árvores', 'Combina classificadores simples, dando mais peso a exemplos difíceis em cada rodada.', { learning: ['supervised'], output: ['category'], data: ['table'], explainability: 2, minData: 'small' }),
  p('dbscan', 'DBSCAN', 'Agrupamento', 'Agrupa pontos vizinhos densos e marca o resto como ruído.', {
    learning: ['unsupervised'], output: ['groups'], data: ['table'], explainability: 2, minData: 'small',
  }),
  p('som', 'Mapa auto-organizável (SOM)', 'Redes neurais', 'Ajusta uma grade de centros que preserva a vizinhança dos dados.', {
    learning: ['unsupervised'], output: ['groups', 'reduction'], data: ['table'], explainability: 2, minData: 'small',
  }),
  p('pca', 'PCA', 'Redução de dimensão', 'Troca variáveis por poucas combinações que guardam a maior variação.', {
    learning: ['unsupervised'], output: ['reduction'], data: ['table'], explainability: 2, minData: 'small',
  }),
  p('algoritmo-genetico', 'Algoritmo genético', 'Computação evolutiva', 'Evolui um conjunto de soluções por seleção, cruzamento e mutação.', {
    learning: [], output: ['solution'], data: ['table'], explainability: 2, minData: 'small',
  }),
  p('q-learning', 'Q-learning', 'Aprendizado por reforço', 'Aprende que ação vale mais em cada situação, testando e recebendo recompensa.', {
    learning: ['reinforcement'], output: ['solution'], data: ['table'], explainability: 2, minData: 'small',
  }),
  p('cnn', 'Rede convolucional (CNN)', 'Redes neurais', 'Rede que aplica os mesmos filtros em cada região da imagem.', {
    learning: ['supervised'], output: ['category', 'number'], data: ['image'], explainability: 1, minData: 'large',
  }),
  p('lstm', 'Rede recorrente (LSTM)', 'Redes neurais', 'Rede que processa uma sequência passo a passo, guardando contexto.', {
    learning: ['supervised'], output: ['category', 'number'], data: ['series', 'text'], explainability: 1, minData: 'large',
  }),
  p('transformer', 'Transformer', 'Redes neurais', 'Rede que pesa a relação entre todas as partes da entrada de uma vez.', {
    learning: ['supervised'], output: ['category', 'number'], data: ['text', 'series', 'image'], explainability: 1, minData: 'large',
  }),
  p('gemeo-digital', 'Gêmeo digital', 'Conceitos', 'Modelo virtual de um sistema real, atualizado com dados medidos dele.', {
    learning: [], output: [], data: ['series'], explainability: 2, minData: 'small',
  }),
]
