import type { ReadyTechnique, Point } from '../../core/types.ts'
import { num } from '../../core/params.ts'

/** Pequeno modelo com splits binários, gradientes, hessianas, gamma e lambda
 * para o comparador numérico. Independente do laboratório de frutas.
 * Demonstração de classificação binária com duas características numéricas.
 */
function fitNumeric(points:Point[],n:number,rate:number,gamma:number,lambda:number){
 const logistic=(v:number)=>1/(1+Math.exp(-Math.max(-30,Math.min(30,v))))
 if(!points.length)return {predict:(_x:number,_y:number)=>0,trained:0}
 const share=Math.max(.001,Math.min(.999,points.filter(p=>p.label===1).length/points.length))
 const base=Math.log(share/(1-share)),scores=points.map(()=>base)
 const trees:{axis:'x'|'y';cut:number;lo:number;hi:number}[]=[]
 for(let k=0;k<n;k++){
  const g=points.map((f,i)=>(f.label===1?1:0)-logistic(scores[i]))
  const h=scores.map(s=>logistic(s)*(1-logistic(s)))
  const leaf=(ids:number[])=>ids.reduce((s,i)=>s+g[i],0)/(lambda+ids.reduce((s,i)=>s+h[i],0))
  const quality=(ids:number[])=>{const gg=ids.reduce((s,i)=>s+g[i],0),hh=ids.reduce((s,i)=>s+h[i],0);return gg*gg/(hh+lambda)}
  const ids=points.map((_,i)=>i),parent=quality(ids)
  let best:{axis:'x'|'y';cut:number;lo:number;hi:number;gain:number}|undefined
  for(const axis of ['x','y'] as const){
   const coordinates=[...new Set(points.map(p=>p[axis]))].sort((a,b)=>a-b)
   for(let i=1;i<coordinates.length;i++){
    const cut=(coordinates[i-1]+coordinates[i])/2
    const low=ids.filter(j=>points[j][axis]<=cut),high=ids.filter(j=>points[j][axis]>cut)
    if(!low.length||!high.length)continue
    const gain=.5*(quality(low)+quality(high)-parent)-gamma
    if(gain>1e-9&&(!best||gain>best.gain))best={axis,cut,lo:leaf(low),hi:leaf(high),gain}
   }
  }
  if(!best)break
  trees.push(best)
  points.forEach((p,i)=>{scores[i]+=rate*(p[best.axis]<=best.cut?best.lo:best.hi)})
 }
 return {trained:trees.length,predict:(x:number,y:number)=>{
  const score=trees.reduce((s,t)=>s+rate*((t.axis==='x'?x:y)<=t.cut?t.lo:t.hi),base)
  return logistic(score)>=.5?1:0
 }}
}
const technique:ReadyTechnique={
 status:'ready',id:'xgboost',name:'XGBoost',
 hierarchy:{area:'Aprendizado de máquina',concept:'Aprendizado supervisionado',family:'Modelos baseados em árvores'},
 compareGroups:['Classificação','Modelos baseados em árvores'],
 summary:'Acrescenta árvores de correção com controle de ganho e regularização, combinando suas contribuições para prever.',
 supervised:true,
 traits:{learning:['supervised'],output:['category','number'],data:['table'],explainability:2,minData:'small'},
 params:[
  {key:'n_estimators',label:'n_estimators',kind:'range',min:1,max:20,step:1,default:4,help:'Número máximo de árvores de correção.'},
  {key:'learning_rate',label:'learning_rate',kind:'range',min:.1,max:1,step:.1,default:.5,help:'Tamanho dos ajustes de cada árvore.'},
  {key:'gamma',label:'gamma',kind:'range',min:0,max:1,step:.1,default:0,help:'Ganho mínimo para permitir uma divisão.'},
  {key:'reg_lambda',label:'reg_lambda',kind:'range',min:.1,max:5,step:.1,default:1,help:'Regularização que reduz os valores das folhas.'},
 ],
 fit(data,params){const m=fitNumeric(data.points,num(params,'n_estimators'),num(params,'learning_rate'),num(params,'gamma'),num(params,'reg_lambda'));return {predict:m.predict,stats:[{label:'Árvores aprendidas',value:String(m.trained)}]}},
 explain:{what:'Treina árvores em sequência para ajustar a previsão, avaliando o ganho de cada divisão e penalizando complexidade excessiva.',use:['Tarefas supervisionadas com dados tabulares.','Quando há dados suficientes para validar ajustes e regularização.'],avoid:['Quando precisamos de uma única regra curta para explicar tudo.','Quando há pouquíssimos exemplos e risco de ajustar ruído.']},
 searchTerms:'XGBoost extreme gradient boosting logistic classification regularization',
}
export default technique
