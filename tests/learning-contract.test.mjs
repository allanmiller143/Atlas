import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
const read=(file)=>readFileSync(new URL('../'+file,import.meta.url),'utf8')
test('último passo supervisionado não usa variável held indefinida',()=>{
 const source=read('src/components/SupervisedJourney.tsx')
 assert.ok(source.includes('step===4&&!training'))
 assert.ok(!source.includes('step===4&&held'))
})
test('todas as técnicas implementadas possuem explicações específicas',()=>{
 const stories=read('src/core/algorithmStories.ts')
 const techniques=['arvore-de-decisao','random-forest','k-means','rede-neural-mlp','hyperbox-fmm']
 for(const id of techniques)assert.ok(stories.includes(`'${id}':`),`Sem narrativa para ${id}`)
})
test('telas de técnica e comparação apresentam roteiros distintos',()=>{
 const technique=read('src/pages/TechniquePage.tsx')
 const compare=read('src/pages/ComparePage.tsx')
 assert.ok(technique.includes('<AlgorithmJourney technique={t}/>'))
 assert.ok(technique.includes('<ParameterGuide technique={t}/>'))
 assert.ok(technique.includes('<GuidedPlayground technique={t}/>'))
 assert.ok(compare.includes('<CompareReasoning techniques={selected} data={ds.data}/>'))
})
