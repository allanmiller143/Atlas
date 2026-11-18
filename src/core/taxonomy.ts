import type { DataKind, Learning, Output, Traits } from './types.ts'

export const LEARNING_LABEL: Record<Learning, string> = {
  supervised: 'Aprende com respostas marcadas',
  unsupervised: 'Sem respostas marcadas',
  reinforcement: 'Aprende por recompensa',
}

export const OUTPUT_LABEL: Record<Output, string> = {
  category: 'Devolve uma categoria',
  number: 'Devolve um número',
  groups: 'Encontra grupos',
  reduction: 'Resume variáveis',
  solution: 'Busca a melhor solução',
}

export const DATA_LABEL: Record<DataKind, string> = {
  table: 'Tabela',
  image: 'Imagem',
  text: 'Texto',
  series: 'Série temporal',
}

export const EXPLAIN_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Difícil de explicar',
  2: 'Explicável em parte',
  3: 'Fácil de explicar',
}

/** Respostas da Home. Campo ausente = "não sei / tanto faz". */
export interface Answers {
  learning?: Learning
  output?: Output
  data?: DataKind
  explain?: boolean
  amount?: 'small' | 'large'
}

export interface Question {
  key: keyof Answers
  title: string
  options: { value: string | boolean; label: string }[]
}

export const QUESTIONS: Question[] = [
  {
    key: 'learning',
    title: 'Seus dados já trazem a resposta certa marcada?',
    options: [
      { value: 'supervised', label: 'Sim, tenho exemplos com a resposta' },
      { value: 'unsupervised', label: 'Não, só tenho os dados' },
      { value: 'reinforcement', label: 'Não tenho dados, o sistema aprende testando' },
    ],
  },
  {
    key: 'output',
    title: 'O que você quer receber?',
    options: [
      { value: 'category', label: 'Uma categoria' },
      { value: 'number', label: 'Um número' },
      { value: 'groups', label: 'Grupos novos' },
      { value: 'reduction', label: 'Menos variáveis' },
      { value: 'solution', label: 'A melhor solução' },
    ],
  },
  {
    key: 'data',
    title: 'Que tipo de dado você tem?',
    options: [
      { value: 'table', label: 'Tabela' },
      { value: 'image', label: 'Imagem' },
      { value: 'text', label: 'Texto' },
      { value: 'series', label: 'Série temporal' },
    ],
  },
  {
    key: 'explain',
    title: 'Você precisa explicar cada decisão?',
    options: [{ value: true, label: 'Sim, preciso explicar' }],
  },
  {
    key: 'amount',
    title: 'Quantos exemplos você tem?',
    options: [
      { value: 'small', label: 'Poucos (centenas)' },
      { value: 'large', label: 'Muitos (milhares ou mais)' },
    ],
  },
]

export function matches(t: Traits, a: Answers): boolean {
  if (a.learning && !t.learning.includes(a.learning)) return false
  if (a.output && !t.output.includes(a.output)) return false
  if (a.data && !t.data.includes(a.data)) return false
  if (a.explain && t.explainability < 2) return false
  if (a.amount === 'small' && t.minData === 'large') return false
  return true
}
