import { test as nodeTest } from 'node:test'
import assert from 'node:assert/strict'
import {trainAdaBoost,classifyFruit,train,test} from '../src/features/adaboost/adaModel.ts'
nodeTest('AdaBoost preserva o conjunto de oito frutas e duas reservadas',()=>{assert.equal(train.length,8);assert.equal(test.length,2)})
nodeTest('pesos normalizados em todas as rodadas',()=>{const m=trainAdaBoost({nEstimators:6});assert.ok(m.trees.length>=2);for(const t of m.trees){assert.ok(Math.abs(t.before.reduce((a,b)=>a+b,0)-1)<1e-9);assert.ok(Math.abs(t.after.reduce((a,b)=>a+b,0)-1)<1e-9)}})
nodeTest('maior peso nos erros da primeira árvore',()=>{const t=trainAdaBoost().trees[0];assert.ok(t.incorrect.length>0);for(const id of t.incorrect){const index=train.findIndex(f=>f.id===id);assert.ok(t.after[index]>t.before[index])}})
nodeTest('mais árvores não apagam as anteriores',()=>{const one=trainAdaBoost({nEstimators:1}),four=trainAdaBoost({nEstimators:4});assert.equal(one.trees[0].question.text,four.trees[0].question.text);assert.ok(four.trees.length>=one.trees.length)})
nodeTest('previsão final é soma de votos ponderados',()=>{const m=trainAdaBoost({nEstimators:4});const c=classifyFruit(test[0],m);const total=c.contributions.reduce((sum,entry)=>sum+entry.delta,0);assert.ok(Math.abs(c.score-total)<1e-10);assert.equal(c.label,c.score>=0?'Maçã':'Laranja')})
nodeTest('learning_rate afeta as contribuições',()=>{const high=trainAdaBoost({learningRate:1,nEstimators:1});const low=trainAdaBoost({learningRate:0.5,nEstimators:1});assert.ok(Math.abs(high.trees[0].alpha-2*low.trees[0].alpha)<1e-9)})
