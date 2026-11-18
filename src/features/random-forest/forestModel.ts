/** Modelo categórico didático de Random Forest: bootstrap + subconjunto aleatório de características em cada nó. */
import { trainingFruits, testingFruits } from '../decision-tree/fruitExamples.ts'
import type { FruitExample } from '../decision-tree/fruitExamples.ts'
export type Fruit = FruitExample
export type Label = Fruit['label']
export type Branch = { question?: string; key?: 'skin'|'color'; value?: string; yes?: Branch; no?: Branch; label:Label; samples:Fruit[] }
export type ForestTree = { root:Branch; sample:Fruit[]; drawnFeatures:string[] }
export type Forest = { trees:ForestTree[]; votes:Label[]; winner:Label; test:Fruit; accuracy:number }
export const train=trainingFruits
export const test=testingFruits
const features=[{key:'skin' as const, value:'Lisa',question:'Casca lisa?'},{key:'color' as const,value:'Vermelha',question:'Cor vermelha?'},{key:'color' as const,value:'Alaranjada',question:'Cor alaranjada?'},{key:'color' as const,value:'Esverdeada',question:'Cor esverdeada?'},{key:'color' as const,value:'Amarelada',question:'Cor amarelada?'}]
export function rngFromSeed(seed:number){let s=(seed>>>0)||1;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296}}
const count=(items:Fruit[],label:Label)=>items.filter(f=>f.label===label).length
function impurity(items:Fruit[]){if(!items.length)return 0;const p=count(items,'Maçã')/items.length;return 2*p*(1-p)}
export function buildBranch(items:Fruit[],depth:number,maxDepth:number,maxFeatures:number,random:()=>number):Branch{
 const label:Label=count(items,'Maçã')>=count(items,'Laranja')?'Maçã':'Laranja'
 const leaf:Branch={label,samples:items}
 if(items.length<2||depth>=maxDepth||impurity(items)===0)return leaf
 // O sorteio seleciona características distintas; testa diferentes valores da cor, quando disponível.
 const featureNames=['skin','color'] as const
 const randomized=[...featureNames]
 for(let i=randomized.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[randomized[i],randomized[j]]=[randomized[j],randomized[i]]}
 const selected=randomized.slice(0,Math.min(2,Math.max(1,maxFeatures)))
 let best:{feature:typeof features[number];yes:Fruit[];no:Fruit[];gain:number}|undefined
 for(const feature of features.filter(f=>selected.includes(f.key))){
  const yes=items.filter(i=>i[feature.key]===feature.value),no=items.filter(i=>i[feature.key]!==feature.value)
  if(!yes.length||!no.length)continue
  const gain=impurity(items)-(yes.length*impurity(yes)+no.length*impurity(no))/items.length
  if(!best||gain>best.gain+1e-10)best={feature,yes,no,gain}
 }
 if(!best||best.gain<=1e-10)return leaf
 return {...leaf,question:best.feature.question,key:best.feature.key,value:best.feature.value,yes:buildBranch(best.yes,depth+1,maxDepth,maxFeatures,random),no:buildBranch(best.no,depth+1,maxDepth,maxFeatures,random)}
}
export function classify(branch:Branch,fruit:Fruit):{label:Label;path:string[]}{
 const path:string[]=[];let current=branch
 while(current.key&&current.value&&current.yes&&current.no){const yes=fruit[current.key]===current.value;path.push(`${current.question} ${yes?'SIM':'NÃO'}`);current=yes?current.yes:current.no}
 return {label:current.label,path}
}
export function forestFromTraining({nEstimators=3,maxDepth=2,maxFeatures=1,seed=7,testIndex=0}:{nEstimators?:number;maxDepth?:number;maxFeatures?:number;seed?:number;testIndex?:number}={}):Forest{
 const random=rngFromSeed(seed);const trees:ForestTree[]=[]
 for(let j=0;j<nEstimators;j++){
  const sample=train.map(()=>train[Math.floor(random()*train.length)])
  trees.push({root:buildBranch(sample,0,maxDepth,maxFeatures,random),sample,drawnFeatures:[]})
 }
 const item=test[Math.min(Math.max(testIndex,0),test.length-1)]
 const votes=trees.map(t=>classify(t.root,item).label)
 const apples=votes.filter(v=>v==='Maçã').length
 // Empates resolvidos de forma determinística por Maçã, apenas nesta demo.
 const winner:Label=apples>=votes.length-apples?'Maçã':'Laranja'
 const accuracy=test.filter(f=>{const v=trees.map(t=>classify(t.root,f).label);return (v.filter(l=>l==='Maçã').length>=v.length/2?'Maçã':'Laranja')===f.label}).length/test.length
 return {trees,votes,winner,test:item,accuracy}
}
