/** Modelo DIDÁTICO e calculado de gradient boosting binário com perda logística.
 * Cada folha aplica uma atualização de Newton aos logits, com regularização L2.
 * Não replica exatamente todas as escolhas internas do scikit-learn.
 */
import { trainingFruits, testingFruits } from '../decision-tree/fruitExamples.ts'
import type { FruitExample } from '../decision-tree/fruitExamples.ts'

export type Fruit = FruitExample
export type Question = { key: 'skin' | 'color'; value: string; label: string }
export type BoostNode = { samples: number[]; correction: number; question?: Question; yes?: BoostNode; no?: BoostNode; gain?: number }
export type Round = { tree: BoostNode; before: number[]; after: number[]; probabilityBefore: number[]; probabilityAfter: number[]; corrections: number[]; trainingLoss: number; rootGain: number }
export type BoostModel = { rounds: Round[]; baseline: number; baselineProbability: number; training: Fruit[]; testing: Fruit[]; learningRate: number; predict: (fruit: Fruit, through?: number) => { score: number; probability: number; label: Fruit['label']; contributions: number[] } }
const questions: Question[] = [
 {key:'skin',value:'Lisa',label:'Casca lisa?'},
 {key:'color',value:'Vermelha',label:'Cor vermelha?'},
 {key:'color',value:'Esverdeada',label:'Cor esverdeada?'},
 {key:'color',value:'Alaranjada',label:'Cor alaranjada?'},
 {key:'color',value:'Amarelada',label:'Cor amarelada?'},
]
export const sigmoid = (score:number) => 1/(1+Math.exp(-Math.max(-30,Math.min(30,score))))
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value))
const isApple=(f:Fruit)=>f.label==='Maçã'?1:0
const splitOn=(f:Fruit,q:Question)=>f[q.key]===q.value
const loss=(items:Fruit[],scores:number[])=>items.reduce((acc,f,i)=>{const p=clamp(sigmoid(scores[i]),1e-8,1-1e-8);return acc-(isApple(f)*Math.log(p)+(1-isApple(f))*Math.log(1-p))},0)/items.length
function leafValue(indices:number[],grad:number[],hess:number[]){
 const g=indices.reduce((sum,i)=>sum+grad[i],0)
 const h=indices.reduce((sum,i)=>sum+hess[i],0)
 return clamp(g/(h+1),-3,3) // regularização L2 = 1, limite didático
}
function quality(indices:number[],grad:number[],hess:number[]){const g=indices.reduce((sum,i)=>sum+grad[i],0);const h=indices.reduce((sum,i)=>sum+hess[i],0);return g*g/(h+1)}
/** Diagnóstico transparente: mesma função de ganho usada para escolher a raiz. */
export function explainRootCandidates(probabilities:number[], minSamplesLeaf=1){
 const indices=trainingFruits.map((_,i)=>i)
 const grad=trainingFruits.map((f,i)=>isApple(f)-probabilities[i])
 const hess=probabilities.map(p=>p*(1-p))
 const parent=quality(indices,grad,hess)
 return questions.map(question=>{
  const yes=indices.filter(i=>splitOn(trainingFruits[i],question))
  const no=indices.filter(i=>!splitOn(trainingFruits[i],question))
  const valid=yes.length>=minSamplesLeaf&&no.length>=minSamplesLeaf
  const gain=valid?quality(yes,grad,hess)+quality(no,grad,hess)-parent:0
  return {question,yesCount:yes.length,noCount:no.length,gain,valid}
 }).sort((a,b)=>b.gain-a.gain)
}
export function trainBoosting({nEstimators=4,learningRate=0.5,maxDepth=1,minSamplesLeaf=1}:{nEstimators?:number;learningRate?:number;maxDepth?:number;minSamplesLeaf?:number}={}):BoostModel{
 const training=trainingFruits, testing=testingFruits
 const p0=clamp(training.filter(f=>isApple(f)).length/training.length,0.001,0.999)
 const baseline=Math.log(p0/(1-p0))
 const scores=training.map(()=>baseline)
 const rounds:Round[]=[]
 const depthLimit=clamp(Math.round(maxDepth),1,3)
 const minLeaf=clamp(Math.round(minSamplesLeaf),1,4)
 const rate=clamp(learningRate,0.05,1)
 const build=(indices:number[],depth:number,grad:number[],hess:number[]):BoostNode=>{
  const node:BoostNode={samples:indices,correction:leafValue(indices,grad,hess)}
  if(depth>=depthLimit||indices.length<2*minLeaf)return node
  let best:{q:Question;yes:number[];no:number[];gain:number}|undefined
  const parentQuality=quality(indices,grad,hess)
  for(const q of questions){
   const yes=indices.filter(i=>splitOn(training[i],q)),no=indices.filter(i=>!splitOn(training[i],q))
   if(yes.length<minLeaf||no.length<minLeaf)continue
   const gain=quality(yes,grad,hess)+quality(no,grad,hess)-parentQuality
   if(gain>1e-8&&(!best||gain>best.gain+1e-9))best={q,yes,no,gain}
  }
  if(!best)return node
  node.question=best.q;node.gain=best.gain
  node.yes=build(best.yes,depth+1,grad,hess);node.no=build(best.no,depth+1,grad,hess)
  return node
 }
 const traverse=(tree:BoostNode,fruit:Fruit):number=>{
  let node=tree
  while(node.question&&node.yes&&node.no)node=splitOn(fruit,node.question)?node.yes:node.no
  return node.correction
 }
 for(let round=0;round<clamp(Math.round(nEstimators),1,10);round++){
  const before=[...scores]
  const probabilityBefore=before.map(sigmoid)
  const grad=training.map((f,i)=>isApple(f)-probabilityBefore[i])
  const hess=probabilityBefore.map(p=>p*(1-p))
  const tree=build(training.map((_,i)=>i),0,grad,hess)
  const corrections=training.map(f=>rate*traverse(tree,f))
  scores.forEach((v,i)=>{scores[i]=v+corrections[i]})
  rounds.push({tree,before,after:[...scores],probabilityBefore,probabilityAfter:scores.map(sigmoid),corrections,trainingLoss:loss(training,scores),rootGain:tree.gain??0})
 }
 return {rounds,baseline,baselineProbability:p0,training,testing,learningRate:rate,
  predict:(fruit,through=rounds.length)=>{
   const contributions=rounds.slice(0,clamp(Math.round(through),0,rounds.length)).map(r=>rate*traverse(r.tree,fruit))
   const score=baseline+contributions.reduce((a,b)=>a+b,0)
   const probability=sigmoid(score)
   return {score,probability,label:probability>=0.5?'Maçã':'Laranja',contributions}
  }
 }
}
