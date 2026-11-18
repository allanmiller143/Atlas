// Contratos centrais do projeto. Toda técnica nova só precisa respeitar estes tipos.

export interface Point {
  x: number // 0..1
  y: number // 0..1
  label: number // classe real (0, 1, 2...)
}

export interface Dataset {
  points: Point[]
  classes: number
}

/** Desenhos extras que a técnica quer mostrar por cima do gráfico. */
export type Overlay =
  | { kind: 'rect'; x0: number; y0: number; x1: number; y1: number; cls: number }
  | { kind: 'dot'; x: number; y: number; cls: number }

export interface Stat {
  label: string
  value: string
}

/** Resultado de treinar uma técnica: sabe responder "qual classe/grupo neste ponto?". */
export interface Model {
  predict: (x: number, y: number) => number
  overlays?: Overlay[]
  stats?: Stat[]
}

export type ParamValue = number | string
export type ParamValues = Record<string, ParamValue>

interface ParamBase {
  key: string
  label: string
  /** Explicação em português simples, mostrada ao clicar no "?". */
  help: string
}
export interface RangeParam extends ParamBase {
  kind: 'range'
  min: number
  max: number
  step: number
  default: number
}
export interface SelectParam extends ParamBase {
  kind: 'select'
  options: { value: string; label: string }[]
  default: string
}
export type Param = RangeParam | SelectParam

// --- Vocabulário usado pelas perguntas da Home ---------------------------------

export type Learning = 'supervised' | 'unsupervised' | 'reinforcement'
export type Output = 'category' | 'number' | 'groups' | 'reduction' | 'solution'
export type DataKind = 'table' | 'image' | 'text' | 'series'

export interface Traits {
  /** Como aprende. Lista vazia = não se aplica (ex.: otimização). */
  learning: Learning[]
  output: Output[]
  data: DataKind[]
  /** 1 = difícil de explicar, 2 = em parte, 3 = fácil. */
  explainability: 1 | 2 | 3
  /** Quantidade de dados a partir da qual a técnica costuma funcionar bem. */
  minData: 'small' | 'large'
}

interface TechniqueBase {
  id: string
  name: string
  /** Classificação hierárquica: área macro > conceito > família de modelos. */
  hierarchy: { area: string; concept: string; family: string }
  /** Grupos funcionais usados para comparação; independentes da navegação. */
  compareGroups: string[]
  summary: string
  traits: Traits
}

/** Aparece no catálogo, mas ainda não tem página nem demo. */
export interface PlannedTechnique extends TechniqueBase {
  status: 'planned'
}

export interface ReadyTechnique extends TechniqueBase {
  status: 'ready'
  /** true se usa os rótulos (classes) dos pontos para treinar. */
  supervised: boolean
  params: Param[]
  fit: (data: Dataset, params: ParamValues) => Model
  explain: {
    what: string
    use: string[]
    avoid: string[]
  }
  /** Termos usados nos links de busca de artigos. */
  searchTerms: string
}

export type Technique = ReadyTechnique | PlannedTechnique
