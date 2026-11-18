import test from 'node:test'
import assert from 'node:assert/strict'
import { train,test as reserved,forestFromTraining, classify } from '../src/features/random-forest/forestModel.ts'

test('treino e teste não compartilham frutas',()=>{
 assert.equal(train.length,8)
 assert.equal(reserved.length,2)
 assert.equal(train.some(f=>reserved.some(x=>x.id===f.id)),false)
})
test('cada árvore tem uma amostra bootstrap e classifica a mesma entrada',()=>{
 const forest=forestFromTraining({nEstimators:5,seed:7})
 assert.equal(forest.trees.length,5)
 assert.equal(forest.votes.length,5)
 assert.ok(forest.trees.every(t=>t.sample.length===8))
 assert.ok(forest.trees.every(t=>t.sample.every(f=>train.includes(f))))
 assert.deepEqual(forest.votes,forest.trees.map(t=>classify(t.root,forest.test).label))
})
test('mesma semente reproduz as árvores; mais árvores altera a quantidade de votos',()=>{
 const first=forestFromTraining({nEstimators:3,seed:12,maxFeatures:1})
 const again=forestFromTraining({nEstimators:3,seed:12,maxFeatures:1})
 assert.deepEqual(first,again)
 assert.equal(forestFromTraining({nEstimators:7,seed:12}).votes.length,7)
})
test('profundidade máxima e subconjunto de características são respeitados',()=>{
 function treeDepth(n:ReturnType<typeof forestFromTraining>['trees'][number]['root']):number{
  return !n.yes||!n.no?0:1+Math.max(treeDepth(n.yes),treeDepth(n.no))
 }
 for(const d of [1,2,3]){
  const forest=forestFromTraining({nEstimators:5,maxDepth:d,maxFeatures:1})
  for(const t of forest.trees)assert.ok(treeDepth(t.root)<=d)
 }
})
