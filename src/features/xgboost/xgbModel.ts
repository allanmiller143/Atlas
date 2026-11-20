/** XGBoost didático para classificação binária com árvores e perda logística.
 * Mantém o mecanismo de gradientes, hessianas, regularização L2 e gamma.
 * Não substitui o pacote XGBoost (tratamento de ausentes, aproximação de quantis,
 * otimizações, convenções de base_score etc. não são reproduzidas).
 */
import { trainingFruits, testingFruits, type FruitExample } from '../decision-tree/fruitExamples.ts'
export type Fruit=FruitExample
export type Question={key:'color'|'skin';value:string;text:string}
export type Node={ids:number[];adjustment:number;question?:Question;yes?:Node;no?:Node;gain?:number}
export type Candidate={question:Question;yes:number;no:number;gain:number}
export type Round={root:Node;before:number[];after:number[];residuals:number[];candidates:Candidate[];loss:number}
export type Options={n_estimators?:number;learning_rate?:number;max_depth?:number;gamma?:number;reg_lambda?:number}
const qs:Question[]=[
 {key:'skin',value:'Lisa',text:'A casca é lisa?'},
 {key:'color',value:'Vermelha',text:'A cor é vermelha?'},
 {key:'color',value:'Esverdeada',text:'A cor é esverdeada?'},
 {key:'color',value:'Alaranjada',text:'A cor é alaranjada?'},
 {key:'color',value:'Amarelada',text:'A cor é amarelada?'},
]
const bound=(x:number,a:number,b:number)=>Math.max(a,Math.min(x,b))
const answer=(f:Fruit)=>f.label==='Maçã'?1:0
export const sigmoid=(s:number)=>1/(1+Math.exp(-bound(s,-30,30)))
export const follows=(f:Fruit,q:Question)=>f[q.key]===q.value
export function walk(root:Node,fruit:Fruit){const path:{question:string;yes:boolean}[]=[];let node=root;while(node.question&&node.yes&&node.no){const yes=follows(fruit,node.question);path.push({question:node.question.text,yes});node=yes?node.yes:node.no}return {leaf:node,path}}
export function trainXgb(input:Options={}){
 const n=bound(Math.round(input.n_estimators??4),1,10)
 const rate=bound(input.learning_rate??0.5,0.05,1)
 const depth=bound(Math.round(input.max_depth??2),1,3)
 const gamma=bound(input.gamma??0.0,0,3)
 const lambda=bound(input.reg_lambda??1,0.1,10)
 const fruits=trainingFruits
 const initialP=fruits.reduce((acc,f)=>acc+answer(f),0)/fruits.length
 const baseline=Math.log(initialP/(1-initialP))
 let scores=fruits.map(()=>baseline)
 const rounds:Round[]=[]
 for(let k=0;k<n;k++){
  const before=[...scores],probs=before.map(sigmoid)
  const residuals=fruits.map((f,i)=>answer(f)-probs[i])
  const hess=probs.map(p=>p*(1-p))
  const ids=fruits.map((_,i)=>i)
  const sum=(xs:number[],v:number[])=>xs.reduce((s,i)=>s+v[i],0)
  const quality=(xs:number[])=>{const g=sum(xs,residuals),h=sum(xs,hess);return g*g/(h+lambda)}
  const candidates=(subset:number[]):Candidate[]=>qs.map(question=>{
   const yes=subset.filter(i=>follows(fruits[i],question)),no=subset.filter(i=>!follows(fruits[i],question))
   const gain=(!yes.length||!no.length)?-Infinity:(quality(yes)+quality(no)-quality(subset))/2-gamma
   return {question,yes:yes.length,no:no.length,gain}
  }).sort((a,b)=>b.gain-a.gain)
  const build=(subset:number[],level:number):Node=>{
   const g=sum(subset,residuals),h=sum(subset,hess)
   const leaf:Node={ids:subset,adjustment:g/(h+lambda)}
   if(level>=depth||subset.length<2)return leaf
   const best=candidates(subset)[0]
   if(!best||best.gain<=1e-9||!Number.isFinite(best.gain))return leaf
   const yes=subset.filter(i=>follows(fruits[i],best.question)),no=subset.filter(i=>!follows(fruits[i],best.question))
   return {...leaf,question:best.question,gain:best.gain,yes:build(yes,level+1),no:build(no,level+1)}
  }
  const root=build(ids,0)
  scores=fruits.map((f,i)=>scores[i]+rate*walk(root,f).leaf.adjustment)
  const loss=fruits.reduce((s,f,i)=>{const p=bound(sigmoid(scores[i]),1e-8,1-1e-8);return s-answer(f)*Math.log(p)-(1-answer(f))*Math.log(1-p)},0)/fruits.length
  rounds.push({root,before,after:[...scores],residuals,candidates:candidates(ids).filter(c=>Number.isFinite(c.gain)),loss})
 }
 const predict=(fruit:Fruit,count=rounds.length)=>{
  const entries=rounds.slice(0,count).map((r,i)=>{
   const trace=walk(r.root,fruit)
   return {round:i+1,...trace,delta:rate*trace.leaf.adjustment}
  })
  const score=baseline+entries.reduce((s,e)=>s+e.delta,0)
  const probability=sigmoid(score)
  return {entries,score,probability,label:probability>=.5?'Maçã' as const:'Laranja' as const}
 }
 return {train:fruits,test:testingFruits,rounds,initialP,baseline,rate,depth,gamma,lambda,predict}
}
