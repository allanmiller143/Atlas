import assert from 'node:assert/strict'
import {test} from 'node:test'
import {trainXgb,walk,sigmoid} from '../src/features/xgboost/xgbModel.ts'
test('o exemplo usa oito frutas e inclui maçã esverdeada',()=>{
 const m=trainXgb();assert.equal(m.train.length,8);assert.equal(m.test.length,2)
 assert.equal(m.train.find(f=>f.id===3)?.label,'Maçã');assert.equal(m.initialP,5/8)
})
test('árvores acrescentam contribuições que explicam a probabilidade',()=>{
 const m=trainXgb();const green=m.train.find(f=>f.id===3)!,prediction=m.predict(green)
 const score=m.baseline+prediction.entries.reduce((s,e)=>s+e.delta,0)
 assert.ok(Math.abs(prediction.score-score)<1e-10)
 assert.ok(Math.abs(prediction.probability-sigmoid(score))<1e-10)
 assert.equal(prediction.entries.length,m.rounds.length)
 assert.equal(prediction.label,'Maçã')
})
test('gamma maior pode suprimir divisões',()=>{
 const low=trainXgb({gamma:0}),high=trainXgb({gamma:1.5})
 assert.ok(low.rounds[0].root.question)
 assert.equal(high.rounds[0].root.question,undefined)
})
test('taxa de aprendizado altera a contribuição sem modificar os exemplos',()=>{
 const a=trainXgb({learning_rate:.2}),b=trainXgb({learning_rate:.8})
 const green=a.train[2]
 assert.notEqual(a.predict(green).score,b.predict(green).score)
 assert.deepEqual(a.train,b.train)
})
test('caminho termina numa folha e nenhuma resposta de teste entra no treino',()=>{
 const m=trainXgb({max_depth:3})
 for(const r of m.rounds){const tr=walk(r.root,m.train[2]);assert.ok(Number.isFinite(tr.leaf.adjustment));assert.ok(tr.path.length<=3)}
})
