import {trainingFruits, testingFruits, type FruitExample} from '../decision-tree/fruitExamples.ts'

/** AdaBoost binário didático com decision stumps (uma pergunta por árvore).
 * Convenção de classificação: maçã = +1, laranja = -1.
 * alpha = 0.5 * ln((1 - erro) / erro), e o voto soma alpha * classe.
 * O scikit-learn atual pode utilizar convenções/variantes diferentes.
 */
export type Fruit = FruitExample
export type Label = Fruit['label']
export type Feature = 'color'|'skin'
export type Question = {feature:Feature;value:string;text:string}
export type Stump = {question:Question;yes:Label;no:Label;error:number;alpha:number;before:number[];after:number[];incorrect:number[];candidates:{text:string;error:number}[]}
export type Ensemble = {trees:Stump[];train:Fruit[];test:Fruit[];learningRate:number}
export const train = trainingFruits
export const test = testingFruits
const questions:Question[] = [
 {feature:'skin',value:'Lisa',text:'A casca é lisa?'},
 {feature:'skin',value:'Rugosa',text:'A casca é rugosa?'},
 ...(['Vermelha','Esverdeada','Alaranjada','Amarelada'] as const).map(value=>({feature:'color' as const,value,text:`A cor é ${value.toLowerCase()}?`}))
]
const group=(f:Fruit,q:Question)=>f[q.feature]===q.value
const sign=(label:Label)=>label==='Maçã'?1:-1
const toLabel=(score:number):Label=>score>=0?'Maçã':'Laranja'
const majority=(items:Fruit[], weights:number[], q:Question, yes:boolean):Label=>{
 let score=0;items.forEach((f,i)=>{if(group(f,q)===yes)score+=weights[i]*sign(f.label)})
 return toLabel(score)
}
const guess=(f:Fruit,question:Question,yes:Label,no:Label)=>group(f,question)?yes:no
export function trainAdaBoost(options:{nEstimators?:number;learningRate?:number}={}):Ensemble{
 const n=Math.max(1,Math.min(12,Math.round(options.nEstimators??4)))
 const learningRate=Math.max(0.1,Math.min(1.5,options.learningRate??1))
 let weights=train.map(()=>1/train.length)
 const trees:Stump[]=[]
 for(let round=0;round<n;round++){
  const candidates=questions.map(question=>{
   const yes=majority(train,weights,question,true),no=majority(train,weights,question,false)
   const error=train.reduce((sum,f,i)=>sum+(guess(f,question,yes,no)===f.label?0:weights[i]),0)
   return {question,yes,no,error}
  }).sort((a,b)=>a.error-b.error)
  const best=candidates[0]
  if(best.error>=0.5-1e-10)break
  const clipped=Math.max(1e-8,Math.min(1-1e-8,best.error))
  const alpha=0.5*Math.log((1-clipped)/clipped)*learningRate
  const incorrect:number[]=[]
  const updated=weights.map((w,i)=>{
   const wrong=guess(train[i],best.question,best.yes,best.no)!==train[i].label
   if(wrong)incorrect.push(train[i].id)
   return w*Math.exp(wrong?alpha:-alpha)
  })
  const total=updated.reduce((a,b)=>a+b,0)
  const after=updated.map(w=>w/total)
  trees.push({question:best.question,yes:best.yes,no:best.no,error:best.error,alpha,before:[...weights],after,incorrect,candidates:candidates.map(c=>({text:c.question.text,error:c.error}))})
  weights=after
  // Quando um stump acerta tudo, nenhum novo erro precisa ser aprendido.
  if(best.error<1e-8)break
 }
 return {trees,train,test,learningRate}
}
export function classifyFruit(fruit:Fruit,model:Ensemble,count=model.trees.length){
 let score=0
 const contributions=model.trees.slice(0,count).map((tree,index)=>{
  const answeredYes=group(fruit,tree.question)
  const label=answeredYes?tree.yes:tree.no
  const delta=tree.alpha*sign(label)
  score+=delta
  return {index:index+1,question:tree.question.text,answeredYes,label,alpha:tree.alpha,delta,score,result:toLabel(score)}
 })
 return {label:toLabel(score),score,contributions}
}
