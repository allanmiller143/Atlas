import test from 'node:test'
import assert from 'node:assert/strict'
import { generate } from '../src/core/datasets.ts'
import type { PresetId } from '../src/core/datasets.ts'
import { accuracyOf } from '../src/core/metrics.ts'
import { defaultsOf } from '../src/core/params.ts'
import type { Dataset, ReadyTechnique } from '../src/core/types.ts'
import kmeans from '../src/techniques/kmeans/index.ts'
import tree from '../src/techniques/decision-tree/index.ts'
import forest from '../src/techniques/random-forest/index.ts'
import mlp from '../src/techniques/mlp/index.ts'
import hyperbox from '../src/techniques/hyperbox/index.ts'

const fitDefault = (t: ReadyTechnique, d: Dataset, over: Record<string, number | string> = {}) =>
  t.fit(d, { ...defaultsOf(t.params), ...over })

test('datasets ficam dentro de [0,1] e têm o tamanho pedido', () => {
  for (const id of ['moons', 'circles', 'blobs', 'xor'] as PresetId[]) {
    const d = generate(id, 120, 0.3, 3)
    assert.equal(d.points.length, 120)
    for (const p of d.points) {
      assert.ok(p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1, `${id} fora do intervalo`)
      assert.ok(p.label >= 0 && p.label < d.classes)
    }
  }
})

test('datasets são determinísticos para a mesma semente', () => {
  assert.deepEqual(generate('moons', 50, 0.2, 5), generate('moons', 50, 0.2, 5))
})

test('k-means separa os 3 grupos (pureza alta)', () => {
  const d = generate('blobs', 150, 0.1, 2)
  const m = fitDefault(kmeans, d, { init: 'plusplus', k: 3 })
  const byCluster = new Map<number, number[]>()
  for (const p of d.points) {
    const c = m.predict(p.x, p.y)
    byCluster.set(c, [...(byCluster.get(c) ?? []), p.label])
  }
  let pure = 0
  for (const labels of byCluster.values()) {
    const counts = new Map<number, number>()
    for (const l of labels) counts.set(l, (counts.get(l) ?? 0) + 1)
    pure += Math.max(...counts.values())
  }
  assert.ok(pure / d.points.length > 0.9, `pureza ${pure / d.points.length}`)
  assert.equal(m.overlays?.length, 3)
})

test('k-means falha em círculos concêntricos (comportamento esperado)', () => {
  const d = generate('circles', 160, 0.1, 2)
  const m = fitDefault(kmeans, d, { k: 2, init: 'plusplus' })
  let agree = 0
  for (const p of d.points) if (m.predict(p.x, p.y) === p.label) agree++
  const frac = Math.max(agree, d.points.length - agree) / d.points.length
  assert.ok(frac < 0.8, `k-means não deveria separar círculos, mas deu ${frac}`)
})

test('árvore: profundidade 1 erra, profundidade alta decora', () => {
  const d = generate('moons', 160, 0.3, 4)
  const shallow = accuracyOf(fitDefault(tree, d, { maxDepth: 1 }), d.points)
  const deep = accuracyOf(fitDefault(tree, d, { maxDepth: 12, minSamples: 2 }), d.points)
  assert.ok(shallow < 0.9, `shallow ${shallow}`)
  assert.ok(deep > 0.97, `deep ${deep}`)
})

test('floresta acerta bem nas luas', () => {
  const d = generate('moons', 160, 0.2, 4)
  const acc = accuracyOf(fitDefault(forest, d), d.points)
  assert.ok(acc > 0.9, `forest ${acc}`)
})

test('rede neural aprende luas e XOR', () => {
  const moons = generate('moons', 160, 0.2, 4)
  const accMoons = accuracyOf(fitDefault(mlp, moons), moons.points)
  assert.ok(accMoons > 0.9, `mlp luas ${accMoons}`)
  const xor = generate('xor', 160, 0.2, 4)
  const accXor = accuracyOf(fitDefault(mlp, xor), xor.points)
  assert.ok(accXor > 0.9, `mlp xor ${accXor}`)
})

test('rede neural com relu também aprende', () => {
  const d = generate('circles', 160, 0.2, 4)
  const acc = accuracyOf(fitDefault(mlp, d, { activation: 'relu', layers: 2, units: 12 }), d.points)
  assert.ok(acc > 0.9, `mlp relu círculos ${acc}`)
})

test('hyperbox classifica bem e θ controla o número de caixas', () => {
  const d = generate('blobs', 150, 0.1, 2)
  const small = fitDefault(hyperbox, d, { theta: 0.06 })
  const big = fitDefault(hyperbox, d, { theta: 0.4 })
  assert.ok(accuracyOf(small, d.points) > 0.9, `acc small ${accuracyOf(small, d.points)}`)
  assert.ok((small.overlays?.length ?? 0) > (big.overlays?.length ?? 0), 'θ menor deveria gerar mais caixas')
  for (const o of small.overlays ?? []) {
    if (o.kind === 'rect') assert.ok(o.x0 <= o.x1 && o.y0 <= o.y1, 'caixa invertida')
  }
})

test('hyperbox funciona em luas e XOR', () => {
  for (const id of ['moons', 'xor'] as PresetId[]) {
    const d = generate(id, 160, 0.2, 4)
    const acc = accuracyOf(fitDefault(hyperbox, d, { theta: 0.1 }), d.points)
    assert.ok(acc > 0.85, `hyperbox ${id} ${acc}`)
  }
})

test('todas as técnicas aguentam conjunto vazio', () => {
  const empty: Dataset = { points: [], classes: 2 }
  for (const t of [kmeans, tree, forest, mlp, hyperbox]) {
    assert.equal(fitDefault(t, empty).predict(0.5, 0.5), 0)
  }
})

import { matches } from '../src/core/taxonomy.ts'
import { PLANNED } from '../src/techniques/planned.ts'

test('perguntas da Home filtram o catálogo', () => {
  const all = [kmeans, tree, forest, mlp, hyperbox, ...PLANNED]
  const names = (a: Parameters<typeof matches>[1]) => all.filter((t) => matches(t.traits, a)).map((t) => t.id)

  const groups = names({ learning: 'unsupervised', output: 'groups' })
  assert.ok(groups.includes('k-means') && groups.includes('dbscan') && groups.includes('som'))
  assert.ok(!groups.includes('random-forest'))

  const solution = names({ output: 'solution' })
  assert.ok(solution.includes('algoritmo-genetico') && solution.includes('q-learning'))

  const explainSmall = names({ learning: 'supervised', explain: true, amount: 'small' })
  assert.ok(explainSmall.includes('arvore-de-decisao'))
  assert.ok(!explainSmall.includes('rede-neural-mlp'), 'MLP não é fácil de explicar')
  assert.ok(!explainSmall.includes('cnn'))

  assert.deepEqual(names({}).length, all.length)
})

test('ids do catálogo são únicos', () => {
  const ids = [kmeans, tree, forest, mlp, hyperbox, ...PLANNED].map((t) => t.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('exemplo de frutas mantém cores coerentes e treino/teste separados', async () => {
  const { fruitExamples, trainingFruits, testingFruits } = await import('../src/core/fruitExamples.ts')
  assert.equal(fruitExamples.length, 10)
  assert.equal(trainingFruits.length, 8)
  assert.equal(testingFruits.length, 2)
  assert.equal(new Set(fruitExamples.map(x => x.id)).size, 10)
  assert.ok(!fruitExamples.some(x => (x.color === 'Amarelada' || x.color === 'Alaranjada') && x.label === 'Maçã'))
  const smooth = trainingFruits.filter(x => x.skin === 'Lisa')
  const rough = trainingFruits.filter(x => x.skin === 'Rugosa')
  assert.equal(smooth.length, 4)
  assert.ok(smooth.every(x => x.label === 'Maçã'))
  assert.equal(rough.filter(x => x.label === 'Maçã').length, 1)
  assert.equal(rough.filter(x => x.label === 'Laranja').length, 3)
})
