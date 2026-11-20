import test from 'node:test'
import assert from 'node:assert/strict'
import { fruitExamples, trainingFruits } from '../src/features/decision-tree/fruitExamples.ts'
import { averageLoss, encodeFruit, predict, startWeights, trainBlock } from '../src/features/neural-networks/neuralDemoModel.ts'

test('a cor é representada por quatro entradas, sem ordem artificial', () => {
  for (const f of fruitExamples) {
    const values = encodeFruit(f)
    assert.equal(values.length, 5)
    assert.equal(values.slice(0, 4).reduce((sum, n) => sum + n, 0), 1)
    assert.equal(values[4], f.skin === 'Lisa' ? 1 : 0)
  }
})

test('a rede gera probabilidade válida para todas as frutas', () => {
  for (const f of fruitExamples) {
    const output = predict(startWeights, f)
    assert.equal(output.hidden.length, 2)
    assert.ok(output.probability > 0 && output.probability < 1)
  }
})

test('treinar altera os pesos e reduz a perda média nos dados de treino', () => {
  const before = averageLoss(startWeights, trainingFruits)
  const next = trainBlock(startWeights, trainingFruits, 0.25, 10)
  const after = averageLoss(next, trainingFruits)
  assert.ok(after < before, `expected training loss ${after} < ${before}`)
  assert.notEqual(next.outputBias, startWeights.outputBias)
  assert.deepEqual(startWeights.inputHidden[0], [0.48, -0.08, -0.25, 0.03, 0.42], 'pesos iniciais não devem sofrer mutação')
})
