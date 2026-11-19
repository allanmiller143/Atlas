import test from 'node:test'
import assert from 'node:assert/strict'
import { trainBoosting, sigmoid, explainRootCandidates } from '../src/features/gradient-boosting/boostingModel.ts'

test('reserva duas frutas e mantém o conjunto original sem contradições',()=>{
 const m=trainBoosting()
 assert.equal(m.training.length,8)
 assert.equal(m.testing.length,2)
 assert.ok(m.training.every(f=>!(f.color==='Amarelada'&&f.label==='Maçã')))
 assert.ok(m.testing.every(f=>!m.training.some(t=>t.id===f.id)))
})
test('gradiente inicial corresponde aos rótulos e probabilidades',()=>{
 const m=trainBoosting({nEstimators:1})
 assert.equal(m.baselineProbability,5/8)
 assert.ok(Math.abs(sigmoid(m.baseline)-5/8)<1e-10)
 assert.ok(m.rounds[0].probabilityBefore.every(p=>Math.abs(p-5/8)<1e-10))
})
test('a perda logística diminui ao acrescentar árvores de correção',()=>{
 const m=trainBoosting({nEstimators:6,learningRate:.5,maxDepth:1})
 for(let i=1;i<m.rounds.length;i++)assert.ok(m.rounds[i].trainingLoss<m.rounds[i-1].trainingLoss)
})
test('uma previsão inclui apenas as correções das rodadas anteriores',()=>{
 const m=trainBoosting({nEstimators:5})
 const f=m.testing[0]
 const initial=m.predict(f,0)
 assert.equal(initial.contributions.length,0)
 assert.equal(initial.score,m.baseline)
 for(let n=1;n<=5;n++){
  const prediction=m.predict(f,n)
  assert.equal(prediction.contributions.length,n)
  assert.ok(Math.abs(prediction.score-(m.baseline+prediction.contributions.reduce((x,y)=>x+y,0)))<1e-8)
 }
})
test('parâmetros mudam resultados e profundidade limita a árvore',()=>{
 const shallow=trainBoosting({maxDepth:1,nEstimators:5})
 const deep=trainBoosting({maxDepth:2,nEstimators:5})
 const slow=trainBoosting({learningRate:.1,nEstimators:5})
 const fast=trainBoosting({learningRate:1,nEstimators:5})
 assert.notDeepEqual(shallow.rounds[0].tree,deep.rounds[0].tree)
 assert.notEqual(slow.rounds[4].trainingLoss,fast.rounds[4].trainingLoss)
 function depth(tree:typeof shallow.rounds[number]['tree']):number{return !tree.yes||!tree.no?0:1+Math.max(depth(tree.yes),depth(tree.no))}
 assert.ok(shallow.rounds.every(x=>depth(x.tree)<=1))
 assert.ok(deep.rounds.every(x=>depth(x.tree)<=2))
})
test('as probabilidades e previsões finais são válidas',()=>{
 const m=trainBoosting()
 for(const f of m.testing){const r=m.predict(f);assert.ok(r.probability>0&&r.probability<1);assert.ok(['Maçã','Laranja'].includes(r.label))}
})

// Verifica que a explicação de escolha da raiz usa exatamente o critério do modelo.
test('perguntas exibidas correspondem à divisão escolhida em cada rodada',()=>{
 const model=trainBoosting({nEstimators:5,maxDepth:1})
 for(const round of model.rounds){
  const candidates=explainRootCandidates(round.probabilityBefore)
  assert.equal(candidates[0].question.label,round.tree.question?.label)
  assert.ok(Math.abs(candidates[0].gain-round.rootGain)<1e-9)
 }
})

test('o resíduo de maçã é positivo e o da laranja é negativo antes da primeira árvore',()=>{
 const model=trainBoosting({nEstimators:1})
 const r=model.rounds[0]
 for(const [i,fruit] of model.training.entries()){
  const y=fruit.label==='Maçã'?1:0
  const residual=y-r.probabilityBefore[i]
  assert.equal(Math.sign(residual),y?1:-1)
 }
})

test('as folhas explicam o ajuste por soma de resíduos, curvatura e regularização',()=>{
 const model=trainBoosting({nEstimators:1,learningRate:.5,maxDepth:1})
 const round=model.rounds[0]
 const leaves=[round.tree.yes,round.tree.no].filter((node):node is NonNullable<typeof node>=>Boolean(node))
 assert.equal(leaves.length,2)
 for(const leaf of leaves){
  const g=leaf.samples.reduce((acc,i)=>acc+(model.training[i].label==='Maçã'?1:0)-round.probabilityBefore[i],0)
  const h=leaf.samples.reduce((acc,i)=>acc+round.probabilityBefore[i]*(1-round.probabilityBefore[i]),0)
  assert.ok(Math.abs(leaf.correction-g/(h+1))<1e-10)
 }
 assert.ok(Math.abs(round.tree.yes!.correction-0.7741935483870968)<1e-10)
})

test('o caminho por todas as árvores reproduz as contribuições da previsão',()=>{
 const model=trainBoosting({nEstimators:4,learningRate:.5,maxDepth:1})
 for(const fruit of model.testing){
  const prediction=model.predict(fruit)
  const contributions=model.rounds.map(r=>{
   let node=r.tree
   while(node.question&&node.yes&&node.no)node=fruit[node.question.key]===node.question.value?node.yes:node.no
   return node.correction*model.learningRate
  })
  contributions.forEach((value,i)=>assert.ok(Math.abs(value-prediction.contributions[i])<1e-12))
 }
})
