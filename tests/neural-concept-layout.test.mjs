import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const chapter = readFileSync(new URL('../src/features/neural-networks/NeuralNetworksChapter.tsx', import.meta.url), 'utf8')
const section = chapter.split('function NeuralConceptDiagram() {')[1]?.split('function NetworkSketch(')[0] ?? ''
const picture = section.split('<svg')[1]?.split('</svg>')[0] ?? ''

test('o diagrama de conceitos separa texto dos cards do SVG', () => {
  assert.ok(section.includes('concepts.map(concept => <Box'))
  assert.ok(section.includes("gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))'"))
  assert.ok(section.includes("gridTemplateColumns: { xs: 'minmax(0, 1fr)'"))
  assert.ok(section.includes("overflowWrap: 'anywhere'"))
  assert.ok(!picture.includes('dizem quanto'))
  assert.ok(!picture.includes('Treinamento</text>'))
  assert.ok(!picture.includes('combina sinais e faz cálculos internos'))
})

test('diagrama tem entradas, neurônios ocultos e saída sem rolagem forçada', () => {
  assert.ok(picture.includes('viewBox="0 0 650 255"'))
  assert.ok(picture.includes('Camada oculta'))
  assert.ok(picture.includes('Chance de maçã'))
  assert.ok(picture.includes('Conexões com pesos aprendidos'))
  assert.ok(!picture.includes('minWidth: 820'))
})
