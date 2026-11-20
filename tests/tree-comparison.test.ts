import test from 'node:test'
import assert from 'node:assert/strict'
import { compareTreeModels, getComparisonFruit, TREE_IDS } from '../src/features/comparison/treeComparison.ts'

test('compara os cinco métodos usando exatamente os dois exemplos reservados',()=>{
 for(let i=0;i<2;i++){
  const fruit=getComparisonFruit(i)
  assert.ok(fruit.id===9||fruit.id===10)
  const results=compareTreeModels(fruit)
  assert.deepEqual(Object.keys(results),[...TREE_IDS])
  for(const id of TREE_IDS){
   const result=results[id]
   assert.ok(['Maçã','Laranja'].includes(result.predicted))
   assert.ok(result.steps.length>0)
   assert.ok(result.detail.length>0)
  }
 }
})
test('um caminho, votos e correções são descritos por mecanismos diferentes',()=>{
 const results=compareTreeModels(getComparisonFruit(1))
 assert.match(results['arvore-de-decisao'].steps.join(' '),/Folha:/)
 assert.equal(results['random-forest'].entries?.length,5)
 assert.ok((results['adaboost'].entries?.length??0)>0)
 assert.equal(results['gradient-boosting'].entries?.length,4)
 assert.equal(results['xgboost'].entries?.length,4)
 assert.ok((results['xgboost'].probability??0)>=0&&(results['xgboost'].probability??0)<=1)
})
