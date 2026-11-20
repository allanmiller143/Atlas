/** Uma mesma base de frutas para comparar os cinco mecanismos de árvores.
 * Os resultados vêm dos simuladores didáticos das respectivas aulas.
 * Não confundir com uma avaliação estatística de produção.
 */
import { trainingFruits, testingFruits, type FruitExample } from '../decision-tree/fruitExamples.ts'
import { forestFromTraining, classify } from '../random-forest/forestModel.ts'
import { trainBoosting } from '../gradient-boosting/boostingModel.ts'
import { trainAdaBoost, classifyFruit } from '../adaboost/adaModel.ts'
import { trainXgb } from '../xgboost/xgbModel.ts'

export const TREE_IDS = ['arvore-de-decisao','random-forest','gradient-boosting','adaboost','xgboost'] as const
export type TreeId = typeof TREE_IDS[number]
export const treeMeta: Record<TreeId,{name:string;how:string;training:string;choice:string;strength:string;tradeoff:string;parameters:string}> = {
 'arvore-de-decisao':{name:'Decision Tree',how:'Uma árvore faz perguntas até chegar a uma folha.',training:'Escolhe divisões que reduzem a mistura das classes (Gini nesta aula).',choice:'Segue um único caminho da raiz até a folha.',strength:'Explicar uma decisão com poucas perguntas.',tradeoff:'Pode mudar bastante se os dados mudarem; árvores profundas podem memorizar.',parameters:'max_depth · min_samples_split'},
 'random-forest':{name:'Random Forest',how:'Várias árvores aprendem com amostras diferentes.',training:'Cada árvore recebe um bootstrap e considera características sorteadas.',choice:'As árvores fazem previsões; a floresta reúne suas respostas.',strength:'Diminuir a dependência de uma árvore específica.',tradeoff:'Explicar a decisão do conjunto é mais difícil.',parameters:'n_estimators · max_depth · max_features'},
 'gradient-boosting':{name:'Gradient Boosting',how:'Uma árvore nova melhora a previsão das anteriores.',training:'Recalcula o que falta corrigir e treina árvores em sequência.',choice:'Soma ajustes e converte a pontuação em probabilidade.',strength:'Aprimorar previsões progressivamente.',tradeoff:'Ajustes e parâmetros exigem atenção para não superajustar.',parameters:'n_estimators · learning_rate · max_depth'},
 'adaboost':{name:'AdaBoost',how:'Erros ganham mais peso na próxima rodada.',training:'Treina classificadores simples e aumenta a importância dos exemplos errados.',choice:'Soma votos com pesos diferentes.',strength:'Combinar regras simples focando nos casos difíceis.',tradeoff:'Pode ser sensível a ruído e rótulos incorretos.',parameters:'n_estimators · learning_rate'},
 'xgboost':{name:'XGBoost',how:'Árvores sequenciais com regras para controlar correções e divisões.',training:'Calcula ganhos de divisão e regulariza os ajustes das folhas.',choice:'Soma ajustes e transforma a pontuação em probabilidade.',strength:'Treinar modelos fortes em dados tabulares com controle de complexidade.',tradeoff:'Tem mais parâmetros e pode ser complexo de ajustar.',parameters:'n_estimators · learning_rate · max_depth · gamma · reg_lambda'},
}
export interface TreeResult { id:TreeId; predicted:FruitExample['label']; detail:string; steps:string[]; initial?:number; probability?:number; entries?:{title:string;result:string;extra?:string}[] }
const fruits = trainingFruits
const questions = [
 {text:'Casca lisa?',yes:(f:FruitExample)=>f.skin==='Lisa'},
 {text:'Cor vermelha?',yes:(f:FruitExample)=>f.color==='Vermelha'},
 {text:'Cor alaranjada?',yes:(f:FruitExample)=>f.color==='Alaranjada'},
 {text:'Cor esverdeada?',yes:(f:FruitExample)=>f.color==='Esverdeada'},
 {text:'Cor amarelada?',yes:(f:FruitExample)=>f.color==='Amarelada'},
]
function impurity(items:FruitExample[]){const p=items.filter(f=>f.label==='Maçã').length/items.length;return 2*p*(1-p)}
/** Mesma seleção Gini e profundidade fixa do exemplo padrão da aula de Decision Tree. */
function dtTrace(fruit:FruitExample){
 let items=fruits
 const steps:string[]=[]
 for(let depth=0;depth<2&&impurity(items)>1e-8;depth++){
  const candidates=questions.map(question=>{
   const yes=items.filter(question.yes),no=items.filter(f=>!question.yes(f))
   return {question,yes,no,gain:yes.length&&no.length?impurity(items)-(yes.length*impurity(yes)+no.length*impurity(no))/items.length:-1}
  }).sort((a,b)=>b.gain-a.gain)
  const best=candidates[0]
  if(!best||best.gain<=1e-9)break
  const yes=best.question.yes(fruit)
  steps.push(`${best.question.text} → ${yes?'SIM':'NÃO'}`)
  items=yes?best.yes:best.no
 }
 const apples=items.filter(f=>f.label==='Maçã').length
 const predicted:FruitExample['label']=apples>=items.length-apples?'Maçã':'Laranja'
 return {predicted,steps:[...steps,`Folha: ${predicted}`]}
}
export function compareTreeModels(fruit:FruitExample):Record<TreeId,TreeResult>{
 const dt=dtTrace(fruit)
 const rf=forestFromTraining({nEstimators:5,maxDepth:2,maxFeatures:1,seed:7,testIndex:testingFruits.findIndex(f=>f.id===fruit.id)})
 const rfPredictions=rf.trees.map((tree,i)=>({index:i+1,...classify(tree.root,fruit)}))
 const appleVotes=rfPredictions.filter(v=>v.label==='Maçã').length
 const rfLabel:FruitExample['label']=appleVotes>=rfPredictions.length-appleVotes?'Maçã':'Laranja'
 const gb=trainBoosting({nEstimators:4,learningRate:.5,maxDepth:1})
 const gbPred=gb.predict(fruit)
 const ada=trainAdaBoost({nEstimators:4,learningRate:1})
 const adaPred=classifyFruit(fruit,ada)
 const xgb=trainXgb({n_estimators:4,learning_rate:.5,max_depth:2,gamma:0,reg_lambda:1})
 const xgbPred=xgb.predict(fruit)
 return {
  'arvore-de-decisao':{id:'arvore-de-decisao',predicted:dt.predicted,detail:'A previsão sai da folha final.',steps:dt.steps,entries:dt.steps.map((s,i)=>({title:`Passo ${i+1}`,result:s}))},
  'random-forest':{id:'random-forest',predicted:rfLabel,detail:`${appleVotes} voto(s) para maçã e ${rfPredictions.length-appleVotes} para laranja, em 5 árvores do simulador.`,steps:['Cada árvore recebe sua amostra bootstrap.', 'Cada árvore percorre suas próprias perguntas.', 'As previsões individuais são combinadas.'],entries:rfPredictions.map(t=>({title:`Árvore ${t.index}`,result:t.label,extra:t.path.join(' → ')||'Folha direta'}))},
  'gradient-boosting':{id:'gradient-boosting',predicted:gbPred.label,detail:`Probabilidade final de maçã: ${(gbPred.probability*100).toFixed(1)}%.`,initial:gb.baselineProbability,probability:gbPred.probability,steps:['Palpite inicial para todas as frutas.', 'Cada árvore acrescenta uma correção à pontuação.', 'A pontuação acumulada vira probabilidade.'],entries:gbPred.contributions.map((v,i)=>({title:`Árvore ${i+1}`,result:`${v>=0?'+':''}${v.toFixed(3)} na pontuação`,extra:'Não é uma porcentagem: a conversão ocorre no final.'}))},
  'adaboost':{id:'adaboost',predicted:adaPred.label,detail:`Placar final ponderado: ${adaPred.score.toFixed(2)} (${adaPred.score>=0?'favorece maçã':'favorece laranja'}).`,steps:['Começa com pesos iguais para os exemplos.', 'Após cada rodada, erros recebem mais importância.', 'Cada árvore vota com uma força própria.'],entries:adaPred.contributions.map(v=>({title:`Árvore ${v.index}`,result:`${v.label} · ${v.delta>=0?'+':''}${v.delta.toFixed(2)} no placar`,extra:`${v.question} ${v.answeredYes?'SIM':'NÃO'} · força ${v.alpha.toFixed(2)}`}))},
  'xgboost':{id:'xgboost',predicted:xgbPred.label,detail:`Probabilidade final de maçã: ${(xgbPred.probability*100).toFixed(1)}%.`,initial:xgb.initialP,probability:xgbPred.probability,steps:['Começa com uma previsão comum.', 'Calcula ganhos e limita divisões/ajustes.', 'Acrescenta correções e converte a pontuação em probabilidade.'],entries:xgbPred.entries.map(e=>({title:`Árvore ${e.round}`,result:`${e.delta>=0?'+':''}${e.delta.toFixed(3)} na pontuação`,extra:e.path.map(p=>`${p.question} ${p.yes?'SIM':'NÃO'}`).join(' → ')||'Folha direta'}))},
 }
}
export function getComparisonFruit(index:number){return testingFruits[Math.max(0,Math.min(testingFruits.length-1,index))]}
export function isTreeId(id:string):id is TreeId{return TREE_IDS.some(t=>t===id)}
