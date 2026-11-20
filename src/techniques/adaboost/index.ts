import type { ReadyTechnique, Point } from '../../core/types.ts'
import { num } from '../../core/params.ts'

type Stump = {axis:'x'|'y';cut:number;yes:number;no:number;alpha:number}
const predict=(stump:Stump,point:{x:number;y:number})=>point[stump.axis]<=stump.cut?stump.yes:stump.no
/** SAMME discreto para múltiplas classes sobre duas variáveis numéricas.
 * A demonstração de frutas em features/adaboost usa a variante binária equivalente
 * (alpha = 1/2 log((1-e)/e)) e stumps categóricos.
 */
function fitAda(points:Point[],classes:number,n:number,learningRate:number){
 const allClasses=Array.from({length:classes},(_,i)=>i)
 const weights=points.map(()=>1/points.length)
 const trees:Stump[]=[]
 if(!points.length||classes<2)return trees
 for(let round=0;round<n;round++){
  let best:{stump:Stump;error:number}|null=null
  for(const axis of ['x','y'] as const){
   const ordered=[...new Set(points.map(p=>p[axis]))].sort((a,b)=>a-b)
   const cuts=ordered.length>1?ordered.slice(1).map((v,i)=>(v+ordered[i])/2):[ordered[0]??0.5]
   for(const cut of cuts){
    const sides=[points.map(p=>p[axis]<=cut),points.map(p=>p[axis]>cut)]
    const labels=sides.map(mask=>{
     const totals=allClasses.map(cls=>points.reduce((acc,p,i)=>acc+(mask[i]&&p.label===cls?weights[i]:0),0))
     return totals.indexOf(Math.max(...totals))
    })
    const stump:Stump={axis,cut,yes:labels[0],no:labels[1],alpha:0}
    const error=points.reduce((sum,p,i)=>sum+(predict(stump,p)===p.label?0:weights[i]),0)
    if(!best||error<best.error-1e-12)best={stump,error}
   }
  }
  if(!best||best.error>=1-1/classes-1e-12)break
  const e=Math.max(best.error,1e-10)
  const alpha=learningRate*(Math.log((1-e)/e)+Math.log(classes-1))
  const stump={...best.stump,alpha}
  trees.push(stump)
  if(best.error<1e-10)break
  points.forEach((p,i)=>{if(predict(stump,p)!==p.label)weights[i]*=Math.exp(alpha)})
  const total=weights.reduce((a,b)=>a+b,0)
  weights.forEach((_,i)=>{weights[i]/=total})
 }
 return trees
}
const technique:ReadyTechnique={
 status:'ready',id:'adaboost',name:'AdaBoost',
 hierarchy:{area:'Aprendizado de máquina',concept:'Aprendizado supervisionado',family:'Modelos baseados em árvores'},
 compareGroups:['Classificação','Modelos baseados em árvores'],
 summary:'Treina classificadores simples em sequência, aumentando a importância dos exemplos que foram classificados incorretamente.',
 supervised:true,
 traits:{learning:['supervised'],output:['category'],data:['table'],explainability:2,minData:'small'},
 params:[
  {key:'n_estimators',label:'n_estimators',kind:'range',min:1,max:20,step:1,default:5,help:'Número máximo de árvores de uma única divisão. Pode parar antes se encontrar uma regra perfeita.'},
  {key:'learning_rate',label:'learning_rate',kind:'range',min:0.1,max:1.5,step:0.1,default:1,help:'Controla a influência da árvore e o quanto aumentam os pesos dos exemplos classificados incorretamente.'},
 ],
 fit(data,p){
  const n=num(p,'n_estimators'),lr=num(p,'learning_rate')
  const stumps=fitAda(data.points,data.classes,n,lr)
  const counts=Array.from({length:data.classes},(_,c)=>data.points.filter(pt=>pt.label===c).length)
  const fallback=counts.indexOf(Math.max(...counts))
  return {predict:(x,y)=>{
   if(!stumps.length)return Math.max(0,fallback)
   const votes=Array.from({length:data.classes},()=>0)
   for(const s of stumps)votes[predict(s,{x,y})]+=s.alpha
   return votes.indexOf(Math.max(...votes))
  },stats:[{label:'Árvores simples treinadas',value:String(stumps.length)}]}
 },
 explain:{what:'Cada árvore pequena tenta separar as classes com uma única pergunta. Os exemplos errados passam a ter mais peso no treinamento seguinte. A previsão final combina os votos das árvores, ponderados pela qualidade de cada uma.',
 use:['Quando classificadores simples precisam ser combinados para resolver uma tarefa supervisionada.','Quando vale investigar quais exemplos o conjunto acha difíceis.'],
 avoid:['Muitos rótulos incorretos podem atrair peso excessivo.','Pode ser difícil justificar a previsão com uma única regra legível.']},
 searchTerms:'AdaBoost adaptive boosting decision stump SAMME classification',
}
export default technique
