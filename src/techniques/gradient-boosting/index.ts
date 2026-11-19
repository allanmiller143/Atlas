import type { ReadyTechnique, Point } from '../../core/types.ts'
import { num } from '../../core/params.ts'

/** Gradient boosting binário para o playground numérico compartilhado.
 * A página de aula usa uma implementação separada, categórica, com frutas.
 */
type Stump = { axis:'x'|'y'; threshold:number; low:number; high:number }
const sigmoid=(v:number)=>1/(1+Math.exp(-Math.max(-30,Math.min(30,v))))
const clip=(v:number)=>Math.max(-3,Math.min(3,v))
function fitBoost(points:Point[],rounds:number,rate:number){
 if(!points.length)return {predict:()=>0,trees:[] as Stump[]}
 const p=Math.max(.01,Math.min(.99,points.filter(f=>f.label===1).length/points.length))
 const base=Math.log(p/(1-p))
 const scores=points.map(()=>base),trees:Stump[]=[]
 for(let k=0;k<rounds;k++){
  const g=points.map((f,i)=>(f.label===1?1:0)-sigmoid(scores[i]))
  const h=scores.map(s=>sigmoid(s)*(1-sigmoid(s)))
  let best:Stump|undefined,bestGain=0
  const quality=(ids:number[])=>{const a=ids.reduce((v,i)=>v+g[i],0);const b=ids.reduce((v,i)=>v+h[i],1);return a*a/b}
  const all=points.map((_,i)=>i),parent=quality(all)
  for(const axis of ['x','y'] as const){
   const coords=[...new Set(points.map(f=>f[axis]))].sort((a,b)=>a-b)
   for(let j=1;j<coords.length;j++){
    const threshold=(coords[j-1]+coords[j])/2
    const low=all.filter(i=>points[i][axis]<=threshold),high=all.filter(i=>points[i][axis]>threshold)
    if(!low.length||!high.length)continue
    const gain=quality(low)+quality(high)-parent
    if(gain>bestGain+1e-9){const leaf=(ids:number[])=>clip(ids.reduce((v,i)=>v+g[i],0)/(1+ids.reduce((v,i)=>v+h[i],0)));best={axis,threshold,low:leaf(low),high:leaf(high)};bestGain=gain}
   }
  }
  if(!best)break
  trees.push(best)
  points.forEach((f,i)=>{scores[i]+=rate*(f[best.axis]<=best.threshold?best.low:best.high)})
 }
 return {trees,predict:(x:number,y:number)=>{const score=trees.reduce((sum,t)=>sum+rate*((t.axis==='x'?x:y)<=t.threshold?t.low:t.high),base);return sigmoid(score)>=.5?1:0}}
}
const technique: ReadyTechnique={
 status:'ready',id:'gradient-boosting',name:'Gradient Boosting',
 hierarchy:{area:'Aprendizado de máquina',concept:'Aprendizado supervisionado',family:'Modelos baseados em árvores'},
 compareGroups:['Classificação','Modelos baseados em árvores'],
 summary:'Constrói árvores em sequência: cada nova árvore aprende uma correção para a previsão acumulada.',
 supervised:true,
 traits:{learning:['supervised'],output:['category'],data:['table'],explainability:2,minData:'small'},
 params:[
  {kind:'range',key:'nEstimators',label:'n_estimators',min:1,max:30,step:1,default:6,help:'Número de árvores adicionadas sequencialmente.'},
  {kind:'range',key:'learningRate',label:'learning_rate',min:.1,max:1,step:.1,default:.5,help:'Escala de cada correção acrescentada à pontuação.'},
 ],
 fit(data,params){const model=fitBoost(data.points,num(params,'nEstimators'),num(params,'learningRate'));return {predict:model.predict,stats:[{label:'Árvores de correção',value:String(model.trees.length)}]}},
 explain:{what:'Começa com uma estimativa simples e acrescenta pequenas árvores que ajustam a pontuação acumulada usando a perda do treinamento.',use:['Dados tabulares onde uma sequência de modelos simples pode produzir boas previsões.','Quando podemos avaliar parâmetros como taxa de aprendizado e número de árvores.'],avoid:['Quando a explicação precisa ser uma única cadeia de perguntas.','Quando o conjunto é muito pequeno e muitas rodadas poderiam aprender ruído.']},
 searchTerms:'gradient boosting decision trees logistic loss classification'
}
export default technique
