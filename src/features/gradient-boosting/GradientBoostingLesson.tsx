import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Divider, LinearProgress, Slider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, Tooltip, IconButton } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import { Link as RouterLink } from 'react-router-dom'
import { DataTable } from '../decision-tree/DecisionTreeLesson.tsx'
import { fruitExamples } from '../decision-tree/fruitExamples.ts'
import type { Fruit, BoostNode, BoostModel } from './boostingModel.ts'
import { explainRootCandidates, trainBoosting } from './boostingModel.ts'
import CodeNotebook from '../../components/learning/CodeNotebook.tsx'
import { gradientBoostingPythonCells } from './pythonCells.ts'
import BoostingComparison from '../tree-models/BoostingComparison.tsx'

const blue='#3672B7',ink='#2B405A'
const techniqueLinkSx={fontWeight:800,color:'primary.main',textDecoration:'underline',textUnderlineOffset:'3px'}
/** Menções a técnicas existentes sempre abrem sua página correspondente. */
function LinkedTechniqueText({text}:{text:string}){
 const parts=text.split(/(Random Forest|Decision Tree)/g)
 return <>{parts.map((part,i)=>part==='Random Forest'||part==='Decision Tree'?<Box key={i} component={RouterLink} to={part==='Random Forest'?'/tecnica/random-forest':'/tecnica/arvore-de-decisao'} sx={techniqueLinkSx}>{part}</Box>:part)}</>
}
const steps=[
 {title:'Conheça as frutas',body:'Antes de treinar qualquer coisa, precisamos de exemplos. Todas as frutas têm características e um nome correto.',watch:'Ainda não existe modelo. Nós sabemos as respostas, mas o algoritmo não aprendeu.'},
 {title:'Separe treino e teste',body:'Reservamos duas frutas para conferir o resultado. As outras oito são usadas para construir o modelo.',watch:'A previsão das frutas de teste só será conferida no fim.'},
 {title:'O palpite inicial é igual para todas',body:'Antes de olhar a cor ou a casca, contamos os nomes das oito frutas. Temos cinco maçãs e três laranjas. Por isso o ponto de partida é 5 ÷ 8 = 62,5% de maçã.',watch:'Não escolhemos cinco maçãs de propósito para favorecer o algoritmo: este é o conjunto de oito exemplos escolhido para a aula. Com quatro de cada, o palpite seria 50%.'},
 {title:'Por que o modelo usa uma pontuação?',body:'Para melhorar uma previsão, as próximas árvores precisam poder SOMAR correções. O algoritmo transforma a probabilidade em um placar interno. Vamos manter esse placar visível em todas as etapas até a resposta final.',watch:'62,5% vira um placar próximo de +0,51. Esse placar não é a previsão final nem um número de frutas; é o número ao qual as árvores somam ajustes.'},
 {title:'Quais frutas precisam de correção?',body:'O palpite inicial é idêntico para todas as frutas, então não pode acertar bem todas. Como conhecemos as respostas do treino, podemos medir quem precisa subir e quem precisa descer.',watch:'Para maçãs, a chance de maçã precisa subir; para laranjas, precisa descer. A diferença resposta − previsão se chama resíduo.'},
 {title:'Como nasce a primeira árvore?',body:'A árvore procura uma pergunta que reúna frutas que precisam de correções parecidas. Ela testa opções e escolhe a divisão com maior ganho estimado. Depois desenha dois ramos.',watch:'A pergunta escolhida não é arbitrária. O ganho mede a redução estimada na perda do modelo, e não a porcentagem de acerto.'},
 {title:'Por que a folha mostra +0,77 em vez de “maçã”?',body:'Esta árvore NÃO foi treinada para dar o nome da fruta. Sua tarefa é corrigir o placar atual. Cada folha reúne várias frutas e calcula um ajuste comum; por isso o número da folha não é o nome da categoria.',watch:'O +0,77 é o ajuste bruto da folha. Com learning_rate = 0,5, a correção realmente somada ao placar é aproximadamente +0,39.'},
 {title:'Aplique a primeira árvore a uma fruta',body:'Agora escolha uma fruta reservada, siga as perguntas da árvore e veja o ajuste da folha entrar no placar. Depois convertemos o novo placar em probabilidade.',watch:'O mesmo ajuste não é somado diretamente à porcentagem. Primeiro alteramos o placar; a porcentagem é recalculada a partir dele.'},
 {title:'Como nasce a SEGUNDA árvore?',body:'A primeira árvore fica pronta e não muda mais. Recalculamos as probabilidades das oito frutas de treino, comparamos novamente com suas respostas e usamos os NOVOS resíduos para construir outra árvore.',watch:'Veja duas tabelas de erros diferentes: uma ANTES da árvore 1 e outra DEPOIS dela. É isso que faz a árvore 2 aprender uma nova correção.'},
 {title:'Acompanhe as árvores sendo adicionadas',body:'Cada rodada gera uma árvore nova. Selecione uma rodada para comparar o desenho, os resíduos utilizados e o efeito acumulado sobre a mesma fruta.',watch:'As árvores anteriores permanecem no modelo. Não existe uma árvore gigante que vai se transformando: existe uma soma de contribuições.'},
 {title:'De onde sai, finalmente, maçã ou laranja?',body:'Vamos seguir uma fruta por TODAS as árvores. O modelo soma o placar inicial e as correções; transforma o total em probabilidade; só então aplica a regra de classificação.',watch:'O nome final vem da probabilidade acumulada, NÃO de uma folha isolada. Com 50% ou mais de maçã, esta demonstração escolhe maçã; abaixo de 50%, escolhe laranja.'},
]

const percent=(v:number)=>`${(v*100).toFixed(1).replace('.',',')}%`
const signed=(v:number)=>`${v>=0?'+':''}${v.toFixed(2).replace('.',',')}`
const fruitColor=(f:Fruit)=>f.color==='Vermelha'?'#D76A71':f.color==='Esverdeada'?'#86B879':f.color==='Alaranjada'?'#EAA75E':'#E4C76B'
function FeatureFruit({f,hideAnswer=false}:{f:Fruit;hideAnswer?:boolean}){
 return <Stack direction="row" alignItems="center" gap={1} sx={{border:'1px solid #DFE6EF',bgcolor:'white',p:1.15,minWidth:0}}>
  <Box sx={{width:16,height:16,borderRadius:'50%',bgcolor:fruitColor(f),border:'1px solid #AAB7C7',flexShrink:0}}/>
  <Box sx={{minWidth:0}}><Typography fontWeight={800} fontSize={12}>{hideAnswer?'Resposta reservada':f.label} · #{f.id}</Typography><Typography fontSize={12} color="text.secondary">Cor {f.color.toLowerCase()} · casca {f.skin.toLowerCase()}</Typography></Box>
 </Stack>
}
function FruitGrid({fruits,hideAnswer=false}:{fruits:Fruit[];hideAnswer?:boolean}){
 return <Box sx={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,185px),1fr))',gap:1}}>{fruits.map(f=><FeatureFruit key={f.id} f={f} hideAnswer={hideAnswer}/>)}</Box>
}
function ProbabilityBar({p,small=false}:{p:number;small?:boolean}){
 return <Box sx={{width:'100%',minWidth:0}}><Box sx={{height:small?10:14,display:'flex',bgcolor:'#F9EAD5',overflow:'hidden',borderRadius:1}}><Box sx={{width:`${p*100}%`,bgcolor:'#C96775',transition:'width .3s ease'}}/></Box><Stack direction="row" justifyContent="space-between" mt={.35}><Typography fontSize={11} color="#9C4857">Maçã {percent(p)}</Typography><Typography fontSize={11} color="#98723E">Laranja {percent(1-p)}</Typography></Stack></Box>
}
function NodeDiagram({root,focus}:{root:BoostNode;focus?:Fruit}){
 type Placement={node:BoostNode;x:number;y:number}
 const placed:Placement[]=[],edges:{from:Placement;to:Placement;answer:string}[]=[]
 let leaves=0
 function position(node:BoostNode,depth:number):Placement{
  let l:Placement|undefined,r:Placement|undefined
  if(node.yes&&node.no){l=position(node.yes,depth+1);r=position(node.no,depth+1)}
  const x=l&&r?(l.x+r.x)/2:110+leaves++*220
  const p={node,x,y:22+depth*118};placed.push(p)
  if(l&&r)edges.push({from:p,to:l,answer:'SIM'},{from:p,to:r,answer:'NÃO'})
  return p
 }
 position(root,0)
 const active=new Set<BoostNode>()
 if(focus){let n=root;active.add(n);while(n.question&&n.yes&&n.no){n=focus[n.question.key]===n.question.value?n.yes:n.no;active.add(n)}}
 const width=Math.max(450,leaves*220+10),height=Math.max(...placed.map(n=>n.y))+100
 return <Box sx={{bgcolor:'#FAFCFF',border:'1px solid #DCE5F0',p:1.5,overflowX:'auto'}}><Box component="svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Árvore de correção: folhas exibem ajustes numéricos, não nomes das frutas" sx={{display:'block',width:'100%',minWidth:Math.min(450,width),maxHeight:410}}>
  {edges.map((e,i)=>{const chosen=active.has(e.from.node)&&active.has(e.to.node);const mid=(e.from.y+70+e.to.y)/2;return <g key={i}><path d={`M${e.from.x} ${e.from.y+74} V${mid} H${e.to.x} V${e.to.y-5}`} fill="none" stroke={chosen?blue:'#AFC3D7'} strokeWidth={chosen?3.5:2}/><rect x={e.to.x-22} y={e.to.y-24} rx="5" width="44" height="18" fill="#FFFFFF" stroke="#DFE6EF"/><text x={e.to.x} y={e.to.y-11} textAnchor="middle" fill="#52708C" fontSize="11">{e.answer}</text></g>})}
  {placed.map((p,i)=><g key={i}><rect x={p.x-100} y={p.y} width="200" height="74" rx="9" fill={p.node.question?'#E8F1FC':'#FFF1DA'} stroke={active.has(p.node)?blue:'#B8CADB'} strokeWidth={active.has(p.node)?3:1.5}/><text x={p.x} y={p.y+27} fontSize="13" fontWeight="700" fill={ink} textAnchor="middle">{p.node.question?.label??`Ajuste: ${signed(p.node.correction)}`}</text><text x={p.x} y={p.y+52} fontSize="11.5" fill="#5E728A" textAnchor="middle">{p.node.samples.length} fruta(s) {p.node.question?'neste grupo':'· folha'}</text></g>)}
 </Box></Box>
}
function LessonPanel({title,children}:{title:string;children:ReactNode}){
 return <Box sx={{bgcolor:'white',border:'1px solid #DCE5EF',p:{xs:1.7,md:2.5},minWidth:0}}><Typography fontWeight={850} fontSize={17} mb={1.3}>{title}</Typography>{children}</Box>
}
function FruitChoice({fruits,index,onChange}:{fruits:Fruit[];index:number;onChange:(i:number)=>void}){
 return <Stack direction="row" gap={1} flexWrap="wrap">{fruits.map((f,i)=><Button key={f.id} variant={index===i?'contained':'outlined'} size="small" onClick={()=>onChange(i)}>Fruta {i+1}: {f.color.toLowerCase()}, casca {f.skin.toLowerCase()}</Button>)}</Stack>
}
function ResidualMiniTable({model,round}:{model:BoostModel;round:number}){
 const r=model.rounds[round]
 return <Box sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow><TableCell>Fruta</TableCell><TableCell>Chance</TableCell><TableCell>Resíduo</TableCell></TableRow></TableHead><TableBody>{model.training.map((f,i)=><TableRow key={f.id}><TableCell sx={{fontSize:12}}>#{f.id} · {f.label}</TableCell><TableCell sx={{fontSize:12}}>{percent(r.probabilityBefore[i])}</TableCell><TableCell sx={{fontSize:12,fontWeight:800}}>{signed((f.label==='Maçã'?1:0)-r.probabilityBefore[i])}</TableCell></TableRow>)}</TableBody></Table></Box>
}
function ScoreLedger({model,fruit,through}:{model:BoostModel;fruit:Fruit;through:number}){
 const result=model.predict(fruit,through)
 const selected=model.rounds.slice(0,through)
 return <Stack gap={1.5}>
  <Box sx={{bgcolor:'#F2F6FB',p:2}}><Typography fontSize={12} fontWeight={850}>PLACAR INTERNO (LOG-ODDS) — É AQUI QUE AS ÁRVORES SOMAM</Typography><Typography mt={1} fontSize={14}>Ponto de partida: <strong>{signed(model.baseline)}</strong></Typography>{selected.map((_,i)=><Typography key={i} fontSize={14} mt={.5}>+ Correção da árvore {i+1}: <strong>{signed(result.contributions[i])}</strong></Typography>)}<Divider sx={{my:1.3}}/><Typography fontSize={17} fontWeight={850}>Placar atual: {signed(result.score)}</Typography></Box>
  <Box sx={{border:'1px solid #DEE7F1',p:2}}><Typography fontSize={12} fontWeight={850} mb={1}>MOSTRADOR PARA O USUÁRIO — PROBABILIDADE</Typography><Typography fontSize={13} mb={1}>Convertemos o placar {signed(result.score)} em chance de maçã:</Typography><ProbabilityBar p={result.probability}/><Typography fontWeight={850} mt={1.2} fontSize={14}>Se parássemos aqui: {result.label}</Typography></Box>
 </Stack>
}
function StageTable({model,stage}:{model:BoostModel;stage:number}){
 return <Box sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow><TableCell>Fruta do treino</TableCell><TableCell>Resposta</TableCell><TableCell>Probabilidade antes</TableCell><TableCell>Resíduo (y − p)</TableCell><TableCell>Probabilidade depois</TableCell></TableRow></TableHead><TableBody>{model.training.map((f,i)=>{const r=model.rounds[stage];const residual=(f.label==='Maçã'?1:0)-r.probabilityBefore[i];return <TableRow key={f.id}><TableCell sx={{fontWeight:750}}>#{f.id} · {f.color.toLowerCase()}, {f.skin.toLowerCase()}</TableCell><TableCell>{f.label}</TableCell><TableCell>{percent(r.probabilityBefore[i])}</TableCell><TableCell sx={{fontFamily:'monospace'}}>{signed(residual)}</TableCell><TableCell><ProbabilityBar p={r.probabilityAfter[i]} small/></TableCell></TableRow>})}</TableBody></Table></Box>
}
function LearningProgress({model,fruit,through}:{model:BoostModel;fruit:Fruit;through:number}){
 const result=model.predict(fruit,through)
 return <Stack gap={1.5}>
  <Stack direction="row" flexWrap="wrap" gap={1}>{[model.baseline,...result.contributions].map((v,i)=><Box key={i} sx={{border:'1px solid #DCE5EF',px:1.7,py:1.4,bgcolor:i===0?'#EFF4FB':'#FFF9ED',minWidth:110}}><Typography fontSize={11} color="text.secondary" fontWeight={750}>{i===0?'Ponto inicial':`Árvore ${i}`}</Typography><Typography fontSize={17} fontWeight={850}>{signed(v)}</Typography></Box>)}</Stack>
  <Box sx={{bgcolor:'#F2F6FB',p:2}}><Typography fontSize={13} color="text.secondary">Pontuação acumulada (logit)</Typography><Typography fontSize={24} fontWeight={850}>{signed(result.score)}</Typography><Typography fontSize={13} mt={.8} mb={1}>Convertida em probabilidade de maçã:</Typography><ProbabilityBar p={result.probability}/><Typography fontWeight={850} sx={{mt:1.5}}>Previsão: {result.label}</Typography></Box>
 </Stack>
}
function CandidateComparison({model,roundIndex}:{model:BoostModel;roundIndex:number}){
 const r=model.rounds[roundIndex]
 const candidates=explainRootCandidates(r.probabilityBefore)
 const best=candidates.find(c=>c.valid&&c.gain>1e-8)
 return <Box sx={{border:'1px solid #DBE6F0',bgcolor:'white',p:{xs:1.5,md:2}}}>
  <Typography fontWeight={850} mb={.5}>Qual pergunta melhora mais a previsão?</Typography>
  <Typography color="text.secondary" fontSize={13} lineHeight={1.75} mb={1.5}>A primeira tarefa é decidir <strong>com qual pergunta a árvore começa</strong>. Testamos as perguntas sobre cor e casca usando as oito frutas, calculamos a melhora prevista para cada divisão e escolhemos a maior.</Typography><Stack direction="row" alignItems="center" flexWrap="wrap" gap={.7} mb={1.2}><Typography fontWeight={800} fontSize={13}>O que é ganho estimado?</Typography><Tooltip title="É uma medida de quanto separar o grupo em dois deve ajudar a corrigir as previsões. Quanto maior o ganho positivo, mais útil é aquela divisão segundo a aproximação usada neste simulador."><IconButton size="small" aria-label="Ajuda sobre ganho estimado"><HelpOutlineRoundedIcon fontSize="small"/></IconButton></Tooltip></Stack>
  <Box sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow><TableCell>Pergunta candidata</TableCell><TableCell>SIM / NÃO</TableCell><TableCell>Ganho estimado</TableCell></TableRow></TableHead><TableBody>{candidates.map((c,i)=><TableRow key={c.question.label} sx={{bgcolor:best?.question.label===c.question.label?'#EAF4EF':'transparent'}}><TableCell sx={{fontWeight:best?.question.label===c.question.label?850:500}}>{c.question.label}{best?.question.label===c.question.label?' · escolhida':''}</TableCell><TableCell>{c.yesCount} / {c.noCount}</TableCell><TableCell sx={{fontFamily:'monospace',fontWeight:800}}>{c.gain.toFixed(3)}</TableCell></TableRow>)}</TableBody></Table></Box>
  <Accordion disableGutters elevation={0} sx={{mt:1.5,bgcolor:'#F8FAFE',border:'1px solid #DBE5F0','&:before':{display:'none'}}}><AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>}><Typography fontSize={13} fontWeight={850}>Veja como o ganho é calculado, sem pular as contas</Typography></AccordionSummary><AccordionDetails><Typography fontSize={13} lineHeight={1.85}>Em cada fruta calculamos <strong>resíduo = resposta − probabilidade</strong> e <strong>curvatura = p × (1 − p)</strong>. Para um grupo: <strong>G</strong> é a soma dos resíduos, e <strong>H</strong> é a soma das curvaturas. Definimos a qualidade do grupo como <strong>G² / (H + 1)</strong>. Para uma pergunta, o ganho é <strong>qualidade do SIM + qualidade do NÃO − qualidade do grupo antes da divisão</strong>. A constante 1 é uma regularização que reduz ajustes extremos. Este é o critério da demonstração, não o Gini da <Box component={RouterLink} to="/tecnica/arvore-de-decisao" sx={techniqueLinkSx}>Decision Tree</Box>.</Typography><Typography fontSize={12} color="text.secondary" mt={1}>É uma aproximação da redução na perda usada para escolher divisões neste modelo didático; não é uma porcentagem de acertos.</Typography></AccordionDetails></Accordion>
 </Box>
}
function ResidualWalkthrough({model,roundIndex=0}:{model:BoostModel;roundIndex?:number}){
 const r=model.rounds[roundIndex]
 const apple=model.training.findIndex(f=>f.label==='Maçã')
 const orange=model.training.findIndex(f=>f.label==='Laranja')
 const row=(index:number)=>{const f=model.training[index],y=f.label==='Maçã'?1:0,p=r.probabilityBefore[index];return <Box sx={{border:'1px solid #DFE6F0',p:1.5,minWidth:0,flex:'1 1 230px'}}><Typography fontWeight={850} fontSize={13}>{f.label} · fruta #{f.id}</Typography><Typography fontSize={13} mt={.7}>Resposta real (y): <strong>{y}</strong></Typography><Typography fontSize={13}>Probabilidade antes (p): <strong>{percent(p)}</strong></Typography><Typography fontSize={13}>Resíduo (y − p): <strong>{signed(y-p)}</strong></Typography><Typography fontSize={12} color="text.secondary" mt={1}>{y-p>0?'Precisamos aumentar a chance de maçã.':'Precisamos diminuir a chance de maçã.'}</Typography></Box>}
 return <Box sx={{bgcolor:'#F8FAFE',p:2}}><Typography fontWeight={850}>De onde vêm os resíduos?</Typography><Typography fontSize={13} lineHeight={1.8} color="text.secondary" my={1}>Resíduo aqui é <strong>resposta real menos probabilidade atual</strong>. Não é um número sorteado. Depois de cada árvore, as probabilidades mudam e precisamos calcular os resíduos novamente.</Typography><Stack direction={{xs:'column',sm:'row'}} gap={1.5}>{row(apple)}{row(orange)}</Stack></Box>
}
function LeafAdjustmentExplanation({model,roundIndex=0}:{model:BoostModel;roundIndex?:number}){
 const r=model.rounds[roundIndex]
 const leafNodes:BoostNode[]=[]
 const visit=(n:BoostNode)=>{if(n.question&&n.yes&&n.no){visit(n.yes);visit(n.no)}else leafNodes.push(n)}
 visit(r.tree)
 return <Box sx={{bgcolor:'white',border:'1px solid #DCE5F0',p:2}}><Typography fontWeight={850} mb={1}>De onde vem o ajuste da folha?</Typography><Typography fontSize={13} lineHeight={1.8} mb={1.5}>O <strong>resíduo</strong> é calculado para cada fruta. O <strong>ajuste</strong> é calculado para o grupo inteiro que chegou à folha. Por isso, +0,375 e +0,77 não precisam ser iguais.</Typography><Stack gap={1.5}>{leafNodes.map((leaf,i)=>{
  const G=leaf.samples.reduce((total,j)=>total+(model.training[j].label==='Maçã'?1:0)-r.probabilityBefore[j],0)
  const H=leaf.samples.reduce((total,j)=>total+r.probabilityBefore[j]*(1-r.probabilityBefore[j]),0)
  return <Box key={i} sx={{bgcolor:'#F7FAFE',p:1.5,border:'1px solid #E2EAF3'}}><Typography fontSize={13} fontWeight={850}>Folha {i+1} · {leaf.samples.length} fruta(s)</Typography><Typography fontSize={12.5} lineHeight={1.85}>Resíduos: {leaf.samples.map(j=>signed((model.training[j].label==='Maçã'?1:0)-r.probabilityBefore[j])).join(' + ')} = <strong>G = {signed(G)}</strong></Typography><Typography fontSize={12.5} lineHeight={1.85}>Curvaturas: soma de p × (1 − p) = <strong>H = {H.toFixed(3).replace('.',',')}</strong></Typography><Typography fontSize={12.5} lineHeight={1.85}>Ajuste da folha = G / (H + 1) = <strong>{signed(leaf.correction)}</strong></Typography><Typography fontSize={12.5} lineHeight={1.85}>Aplicando learning_rate = {model.learningRate.toFixed(1).replace('.',',')}: <strong>{signed(leaf.correction*model.learningRate)}</strong> é somado à pontuação de quem cair nesta folha.</Typography></Box>
 })}</Stack><Typography fontSize={12} color="text.secondary" lineHeight={1.7} mt={1.5}>Esse ajuste atua sobre a <strong>pontuação (log-odds)</strong>, não é uma adição direta de pontos percentuais à probabilidade.</Typography></Box>
}
function FruitTreeTrace({model,fruit,selected,onSelect}:{model:BoostModel;fruit:Fruit;selected:number;onSelect:(n:number)=>void}){
 const result=model.predict(fruit)
 const current=model.rounds[selected]
 const path:{question:string;choice:string}[]=[]
 let node=current.tree
 while(node.question&&node.yes&&node.no){const yes=fruit[node.question.key]===node.question.value;path.push({question:node.question.label,choice:yes?'SIM':'NÃO'});node=yes?node.yes:node.no}
 const before=model.predict(fruit,selected)
 const after=model.predict(fruit,selected+1)
 const contribution=after.contributions[selected]
 return <Stack gap={2}>
   <Stack direction="row" flexWrap="wrap" gap={1}>{model.rounds.map((_,i)=><Button key={i} size="small" variant={selected===i?'contained':'outlined'} onClick={()=>onSelect(i)}>Ver árvore {i+1}</Button>)}</Stack>
   <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'minmax(0,1.3fr) minmax(250px,1fr)'},gap:2,alignItems:'start'}}>
    <Box><NodeDiagram root={current.tree} focus={fruit}/><Typography fontSize={12} color="text.secondary" mt={1}>A linha azul mostra o caminho desta fruta nesta árvore.</Typography></Box>
    <Box sx={{bgcolor:'#F5F8FD',p:2.5}}><Typography fontWeight={850} mb={1}>Árvore {selected+1}: siga as perguntas</Typography>
      {path.length?path.map((part,i)=><Typography key={i} fontSize={14} lineHeight={1.9}>{i+1}. <strong>{part.question}</strong> Resposta: <strong>{part.choice}</strong>.</Typography>):<Typography fontSize={14}>Essa árvore não precisou fazer uma pergunta.</Typography>}
      <Typography fontSize={14} mt={1.5} lineHeight={1.75}>Ao chegar à folha, o modelo encontra uma <strong>correção</strong>. Com ela, a chance de maçã passa de <strong>{percent(before.probability)}</strong> para <strong>{percent(after.probability)}</strong>.</Typography>
      <Box mt={1.5}><Typography fontWeight={750} fontSize={12} mb={.5}>Antes</Typography><ProbabilityBar p={before.probability}/></Box>
      <Box mt={1.5}><Typography fontWeight={750} fontSize={12} mb={.5}>Depois</Typography><ProbabilityBar p={after.probability}/></Box>
    </Box>
   </Box>
   <Accordion elevation={0} disableGutters sx={{bgcolor:'white',border:'1px solid #DCE5EF','&:before':{display:'none'}}}><AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>}><Typography fontWeight={800}>Ver a conta numérica desta correção</Typography></AccordionSummary><AccordionDetails><Typography fontSize={14} lineHeight={1.85}>A folha sugeriu o ajuste bruto <strong>{signed(node.correction)}</strong>. Multiplicamos pelo <code>learning_rate</code> de {model.learningRate.toFixed(1).replace('.',',')}, obtendo <strong>{signed(contribution)}</strong> para a pontuação interna. A probabilidade é recalculada a partir dessa pontuação. Por isso a variação da barra não é simplesmente o número da folha em pontos percentuais.</Typography><Typography fontSize={13} color="text.secondary" mt={1}>Após todas as {model.rounds.length} árvores: {percent(result.probability)} de chance de maçã.</Typography></AccordionDetails></Accordion>
 </Stack>
}

function ForestTimeline({model,fruit,through,onSelect}:{model:BoostModel;fruit:Fruit;through:number;onSelect?:(i:number)=>void}){
 const prediction=model.predict(fruit,through)
 return <Stack gap={1.2}><Typography fontWeight={850}>O conjunto de árvores acumuladas</Typography><Typography fontSize={13} color="text.secondary" lineHeight={1.7}>Cada cartão é uma árvore diferente, treinada depois da anterior. Selecione uma para ver sua estrutura; as anteriores continuam no modelo.</Typography><Box sx={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(148px,1fr))',gap:1}}>{model.rounds.slice(0,through).map((r,i)=><Box key={i} onClick={onSelect?()=>onSelect(i):undefined} sx={{border:'1px solid #D9E4F1',bgcolor:i===through-1?'#EAF2FE':'white',p:1.5,cursor:onSelect?'pointer':'default'}}><Typography fontWeight={850} fontSize={12}>Árvore {i+1}</Typography><Typography fontSize={12} color="text.secondary">{r.tree.question?.label??'Sem divisão'}</Typography><Typography fontSize={14} fontWeight={850} color="primary.main" mt={1}>{signed(prediction.contributions[i])}</Typography><Typography fontSize={11} color="text.secondary">ajuste nesta fruta</Typography></Box>)}</Box><Typography fontSize={13} lineHeight={1.8}>Pontuação = <strong>{signed(model.baseline)}</strong> (início) + {prediction.contributions.map(signed).join(' + ')} = <strong>{signed(prediction.score)}</strong>. Probabilidade de maçã: <strong>{percent(prediction.probability)}</strong>.</Typography></Stack>
}
function ParameterField({name,value,onChange,min,max,step,help}:{name:string;value:number;onChange:(x:number)=>void;min:number;max:number;step:number;help:string}){
 return <Box sx={{mb:2.5}}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontFamily="monospace" fontSize={13} fontWeight={850}>{name}</Typography><Chip size="small" label={value}/></Stack><Typography color="text.secondary" lineHeight={1.6} fontSize={12} mt={.5}>{help}</Typography><Slider aria-label={name} value={value} onChange={(_,v)=>onChange(v as number)} min={min} max={max} step={step} valueLabelDisplay="auto"/></Box>
}
export default function GradientBoostingLesson(){
 const [step,setStep]=useState(0),[round,setRound]=useState(0),[lessonRound,setLessonRound]=useState(0),[traceRound,setTraceRound]=useState(0),[testIndex,setTestIndex]=useState(0),[showTruth,setShowTruth]=useState(false)
 const [nEstimators,setNEstimators]=useState(4),[learningRate,setLearningRate]=useState(.5),[maxDepth,setMaxDepth]=useState(1),[minLeaf,setMinLeaf]=useState(1)
 const model=useMemo(()=>trainBoosting({nEstimators,learningRate,maxDepth,minSamplesLeaf:minLeaf}),[nEstimators,learningRate,maxDepth,minLeaf])
 const example=trainBoosting({nEstimators:4,learningRate:.5,maxDepth:1,minSamplesLeaf:1})
 const activeRound=Math.min(round,model.rounds.length-1)
 const testFruit=model.testing[testIndex]
 const current=steps[step]
 const changeStep=(v:number)=>{setStep(v);setShowTruth(false)}
 return <Stack spacing={4}>
 <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
  <Typography color="primary.main" fontSize={12} fontWeight={850} letterSpacing=".1em">AULA INTERATIVA · DO PRIMEIRO PALPITE À PREVISÃO</Typography>
  <Typography component="h2" sx={{fontSize:{xs:27,md:35},fontWeight:850,letterSpacing:'-.04em',mt:1}}>Uma árvore melhora o trabalho da anterior</Typography>
  <Typography sx={{fontSize:16,lineHeight:1.85,maxWidth:830,mt:1,mb:3,color:'text.secondary'}}><Box component={RouterLink} to="/tecnica/random-forest" sx={techniqueLinkSx}>Random Forest</Box> treina várias árvores separadamente. Aqui, a segunda árvore só pode começar depois que a primeira terminou. Vamos descobrir o que cada uma acrescenta — usando as mesmas frutas.</Typography>
  <Box sx={{bgcolor:'#F2F6FB',p:{xs:2,md:3}}}>
   <Stack direction="row" flexWrap="wrap" gap={.8} mb={3}>{steps.map((_,i)=><Button key={i} variant={step===i?'contained':'outlined'} size="small" sx={{minWidth:42}} onClick={()=>changeStep(i)} aria-current={step===i?'step':undefined}>{i+1}</Button>)}</Stack>
   <Typography color="text.secondary" fontSize={12} fontWeight={800}>ETAPA {step+1} DE {steps.length}</Typography>
   <Typography component="h3" fontWeight={850} fontSize={{xs:21,md:25}} mt={.6}>{current.title}</Typography>
   <Typography lineHeight={1.85} mt={1} mb={2.5} sx={{maxWidth:850}}><LinkedTechniqueText text={current.body}/></Typography>
   {step===0&&<><DataTable items={fruitExamples}/><Typography fontSize={13} mt={1.3} color="text.secondary">Nenhuma árvore foi treinada.</Typography></>}
   {step===1&&<Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'1.15fr 1fr'},gap:2}}><Box><Typography fontWeight={800} mb={1}>Treino · 8 frutas</Typography><DataTable items={model.training}/></Box><Box><Typography fontWeight={800} mb={1}>Teste · 2 frutas</Typography><DataTable items={model.testing} hideAnswer/></Box></Box>}
   {step===2&&<Stack gap={2}>
    <LessonPanel title="As oito frutas que realmente usamos no treino"><FruitGrid fruits={example.training}/></LessonPanel>
    <LessonPanel title="Não é uma escolha do algoritmo: é uma contagem"><Typography lineHeight={1.8} mb={1.5}>O nosso conjunto de treino contém <strong>5 maçãs e 3 laranjas</strong>. Neste exemplo, todas as frutas recebem inicialmente a mesma chance de ser maçã. Ainda não examinamos cor nem casca.</Typography><Typography fontWeight={850} mb={1}>5 maçãs ÷ 8 frutas = 62,5%</Typography><ProbabilityBar p={example.baselineProbability}/><Typography mt={2} fontWeight={850}>E se os dados fossem diferentes?</Typography><Stack mt={1} gap={1.5}>{[{a:5,b:3},{a:4,b:4},{a:3,b:5}].map(v=><Box key={v.a} sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'180px 1fr'},gap:1,alignItems:'center'}}><Typography fontSize={13}>{v.a} maçãs · {v.b} laranjas</Typography><ProbabilityBar p={v.a/8} small/></Box>)}</Stack><Typography mt={1.5} fontSize={13} lineHeight={1.8}>Se fossem 4 e 4, começaríamos em <strong>50%</strong>. O modelo não saberia qual classe escolher sem olhar as características. Em um empate exato, é necessária uma regra de desempate para produzir um nome, mas a probabilidade continua em 50%.</Typography></LessonPanel>
   </Stack>}
   {step===3&&<Stack gap={2}>
    <LessonPanel title="Uma calculadora com dois mostradores"><Typography lineHeight={1.8} mb={2}>Pense no modelo como uma calculadora. Ela guarda um <strong>placar interno</strong>, mas mostra ao usuário uma <strong>probabilidade</strong>. Para somar as correções das árvores, precisamos primeiro dessa transformação.</Typography><ScoreLedger model={example} fruit={example.testing[testIndex]} through={0}/></LessonPanel>
    <LessonPanel title="Por que não somar diretamente 10% à probabilidade?"><Typography lineHeight={1.8}>Porque uma probabilidade deve continuar entre 0% e 100%. Somar números livremente poderia produzir 120% ou −15%. O <strong>log-odds</strong> é só o nome matemático do placar interno, que pode subir ou descer sem esse limite. Na etapa seguinte, continuaremos usando o MESMO placar.</Typography><Accordion elevation={0} sx={{mt:2,bgcolor:'#F8FAFD'}}><AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>}><Typography fontWeight={800}>Ver a conversão matemática (opcional)</Typography></AccordionSummary><AccordionDetails><Typography fontSize={14} lineHeight={1.8}>Placar inicial = ln(0,625 ÷ 0,375) ≈ <strong>+0,51</strong>. Para transformar um placar S em probabilidade: p = 1 ÷ (1 + e^(−S)). Não precisa calcular isso à mão: acompanhe os dois números no quadro.</Typography></AccordionDetails></Accordion></LessonPanel>
   </Stack>}
   {step===4&&<Stack gap={2}>
    <LessonPanel title="O primeiro palpite é igual, mas as respostas reais não"><Typography lineHeight={1.8} mb={1.5}>A calculadora começa dizendo 62,5% de maçã para TODAS. Só que no treino sabemos quais são maçãs e quais são laranjas. Por isso podemos medir o erro.</Typography><Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},gap:2}}><Box sx={{bgcolor:'#FFF0F0',p:2}}><Typography fontWeight={850}>Para uma maçã</Typography><Typography fontSize={14} mt={1}>Resposta correta = 1</Typography><Typography fontSize={14}>Previsão = 0,625</Typography><Typography fontWeight={850} mt={1}>1 − 0,625 = +0,375</Typography><Typography fontSize={13}>Pede para aumentar o placar.</Typography></Box><Box sx={{bgcolor:'#FFF6E9',p:2}}><Typography fontWeight={850}>Para uma laranja</Typography><Typography fontSize={14} mt={1}>Resposta correta = 0</Typography><Typography fontSize={14}>Previsão = 0,625</Typography><Typography fontWeight={850} mt={1}>0 − 0,625 = −0,625</Typography><Typography fontSize={13}>Pede para diminuir o placar.</Typography></Box></Box><Typography mt={1.5} fontSize={13} lineHeight={1.8}><strong>Resíduo</strong> é o nome dessa diferença. O valor +0,375 pode aparecer como +0,38 apenas porque arredondamos.</Typography></LessonPanel>
    <Accordion elevation={0} sx={{bgcolor:'white'}}><AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>}><Typography fontWeight={800}>Mostrar os resíduos das oito frutas</Typography></AccordionSummary><AccordionDetails><StageTable model={example} stage={0}/></AccordionDetails></Accordion>
   </Stack>}
   {step===5&&<Stack gap={2}>
    <LessonPanel title="A primeira árvore precisa escolher uma pergunta"><Typography lineHeight={1.8} mb={1.5}>A árvore tenta perguntas sobre <strong>cor</strong> e <strong>textura</strong>. A ideia é separar os exemplos que pedem aumento daqueles que pedem diminuição. Ela calcula uma nota de melhora para cada pergunta e escolhe a maior.</Typography><CandidateComparison model={example} roundIndex={0}/></LessonPanel>
    <LessonPanel title="A pergunta escolhida vira a raiz da árvore"><Typography mb={1.5} fontSize={14}>Veja os dois caminhos que a pergunta criou. Ainda não há resposta “maçã” ou “laranja” nas folhas porque o trabalho desta árvore é fornecer <strong>ajustes</strong>.</Typography><NodeDiagram root={example.rounds[0].tree}/></LessonPanel>
   </Stack>}
   {step===6&&<Stack gap={2}>
    <LessonPanel title="Uma folha não dá a classe; dá uma correção"><Typography lineHeight={1.8} mb={1}>A Decision Tree de classificação termina numa classe. Mas <strong>esta árvore é uma etapa de correção dentro do Gradient Boosting</strong>. Em cada folha há um grupo de frutas e uma correção compartilhada. Vamos abrir a conta de um grupo.</Typography><LeafAdjustmentExplanation model={example} roundIndex={0}/></LessonPanel>
    <LessonPanel title="Do +0,77 ao número que realmente somamos"><Typography lineHeight={1.8}>Se uma folha sugerir <strong>+0,77</strong>, esse não é um resultado de classificação, nem significa +77%. Com <strong>learning_rate = 0,5</strong>, o modelo soma apenas <strong>+0,77 × 0,5 ≈ +0,39</strong> ao placar anterior. A seguir veremos a probabilidade mudar com essa soma.</Typography></LessonPanel>
   </Stack>}
   {step===7&&<Stack gap={2}>
    <FruitChoice fruits={example.testing} index={testIndex} onChange={setTestIndex}/>
    <LessonPanel title="Siga uma fruta pela primeira árvore"><NodeDiagram root={example.rounds[0].tree} focus={example.testing[testIndex]}/><Typography mt={1.5} lineHeight={1.8}>A linha azul percorre a pergunta até uma folha. Esta folha devolve um <strong>número para somar ao placar</strong> que já tínhamos, não o nome da fruta.</Typography></LessonPanel>
    <LessonPanel title="A conta, sem pular nenhum número"><ScoreLedger model={example} fruit={example.testing[testIndex]} through={1}/></LessonPanel>
   </Stack>}
   {step===8&&<Stack gap={2}>
    <LessonPanel title="Árvore 1 pronta. Agora os erros mudaram."><Typography lineHeight={1.8} mb={1.5}>A árvore 1 alterou as probabilidades das oito frutas de TREINO. Antes de fazer a árvore 2, calculamos novamente <strong>resposta − nova probabilidade</strong> para cada fruta. A nova árvore aprende com esses resíduos atualizados, e a primeira continua guardada.</Typography><Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},gap:2}}><Box><Typography fontWeight={800} mb={1}>Antes da árvore 1</Typography><ResidualMiniTable model={example} round={0}/></Box><Box><Typography fontWeight={800} mb={1}>Depois da árvore 1 · antes da árvore 2</Typography><ResidualMiniTable model={example} round={1}/></Box></Box></LessonPanel>
    <LessonPanel title="Veja a árvore 2 nascer com esses novos resíduos"><CandidateComparison model={example} roundIndex={1}/><Box mt={2}><NodeDiagram root={example.rounds[1].tree}/></Box><Typography mt={1.5} lineHeight={1.8}>Esses números foram recalculados, por isso a nova árvore pode escolher outra divisão ou outro tamanho de correção. Mesmo quando repete a pergunta, ela <strong>não é uma cópia</strong>: suas folhas recebem novos valores.</Typography></LessonPanel>
   </Stack>}
   {step===9&&<Stack gap={2}>
    <FruitChoice fruits={example.testing} index={testIndex} onChange={v=>{setTestIndex(v);setLessonRound(0)}}/>
    <LessonPanel title="Quatro árvores independentes, adicionadas uma após a outra"><Stack direction="row" flexWrap="wrap" gap={1} mb={2}>{example.rounds.map((_,i)=><Button key={i} size="small" variant={lessonRound===i?'contained':'outlined'} onClick={()=>setLessonRound(i)}>Árvore {i+1}</Button>)}</Stack><NodeDiagram root={example.rounds[lessonRound].tree} focus={example.testing[testIndex]}/><Typography fontSize={14} lineHeight={1.8} mt={1}>A árvore {lessonRound+1} soma sua contribuição ao placar deixado pelas anteriores. A árvore 1 não foi modificada quando a árvore 2 nasceu.</Typography><ScoreLedger model={example} fruit={example.testing[testIndex]} through={lessonRound+1}/></LessonPanel>
   </Stack>}
   {step===10&&<Stack gap={2}>
    <FruitChoice fruits={example.testing} index={testIndex} onChange={v=>{setTestIndex(v);setTraceRound(0);setShowTruth(false)}}/>
    <LessonPanel title="Percorra todas as árvores até formar a resposta"><FruitTreeTrace model={example} fruit={example.testing[testIndex]} selected={traceRound} onSelect={setTraceRound}/><Box mt={2}><ScoreLedger model={example} fruit={example.testing[testIndex]} through={4}/></Box></LessonPanel>
    <LessonPanel title="Só agora transformamos o resultado em um nome"><Typography lineHeight={1.8} mb={1}>Usamos a probabilidade FINAL: pelo menos 50% de maçã significa previsão de maçã; abaixo disso, laranja. <strong>Nenhuma folha sozinha escolhe essa resposta.</strong></Typography><Typography fontWeight={850}>Previsão: {example.predict(example.testing[testIndex]).label}</Typography>{showTruth?<Typography mt={1.5} fontWeight={850} color={example.predict(example.testing[testIndex]).label===example.testing[testIndex].label?'success.main':'error.main'}>Resposta real: {example.testing[testIndex].label} · {example.predict(example.testing[testIndex]).label===example.testing[testIndex].label?'Acertou!':'Errou.'}</Typography>:<Button variant="outlined" sx={{mt:2}} onClick={()=>setShowTruth(true)}>Revelar resposta guardada</Button>}</LessonPanel>
   </Stack>}
   <Box sx={{borderTop:'1px solid #D7E2F0',mt:3,pt:2}}><Typography color="primary.dark" fontSize={13} fontWeight={850}>O QUE OBSERVAR</Typography><Typography lineHeight={1.75} fontSize={14} mt={.5}><LinkedTechniqueText text={current.watch}/></Typography></Box>
   <Stack direction="row" justifyContent="space-between" gap={1} mt={3}><Button startIcon={<ArrowBackRoundedIcon/>} disabled={step===0} onClick={()=>changeStep(step-1)}>Anterior</Button><Button variant="contained" endIcon={<ArrowForwardRoundedIcon/>} onClick={()=>changeStep(step===steps.length-1?0:step+1)}>{step===steps.length-1?'Recomeçar':'Próxima etapa'}</Button></Stack><LinearProgress variant="determinate" value={(step+1)/steps.length*100} sx={{mt:2,height:4}}/>
  </Box>
 </Box>
 <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
  <Typography component="h2" fontWeight={850} fontSize={{xs:25,md:29}} mb={1}>Parâmetros de treinamento</Typography>
  <Typography color="text.secondary" lineHeight={1.8} mb={2}>Esses valores são escolhidos antes do treino e controlam como as árvores são acrescentadas. Não são regras que o algoritmo descobriu sozinho.</Typography>
  <Box sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow><TableCell>Parâmetro</TableCell><TableCell>O que controla</TableCell><TableCell>Na demonstração</TableCell></TableRow></TableHead><TableBody>{[
   ['n_estimators','Quantas árvores são adicionadas, uma após a outra.','1 a 8'],
   ['learning_rate','Quão grande é a contribuição de cada nova árvore. Menor exige geralmente mais rodadas.','0,1 a 1,0'],
   ['max_depth','Profundidade de cada árvore de correção. Árvores maiores aprendem combinações mais específicas.','1 a 2'],
   ['min_samples_leaf','Quantidade mínima de frutas em uma folha. Folhas pequenas podem aprender detalhes demais.','1 a 3'],
  ].map(([name,description,range])=><TableRow key={name}><TableCell sx={{fontWeight:850,fontFamily:'monospace'}}>{name}</TableCell><TableCell sx={{lineHeight:1.7}}>{description}</TableCell><TableCell>{range}</TableCell></TableRow>)}</TableBody></Table></Box>
 </Box>
 <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
  <Typography component="h2" fontWeight={850} fontSize={{xs:25,md:30}}>Experimente o Gradient Boosting</Typography>
  <Typography lineHeight={1.8} mt={1} mb={3} color="text.secondary" sx={{maxWidth:860}}>O laboratório continua usando frutas, não bolinhas abstratas. Altere um parâmetro, escolha uma rodada e veja a árvore de correção e a probabilidade se transformarem. Os números são calculados no navegador com uma versão didática de boosting logístico.</Typography>
  <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'285px minmax(0,1fr)'},gap:3,alignItems:'start'}}>
   <Box sx={{bgcolor:'#F2F6FB',p:2.5}}><Typography fontWeight={850} mb={2}>1. Ajuste o treinamento</Typography>
    <ParameterField name="n_estimators" value={nEstimators} onChange={v=>{setNEstimators(v);setRound(0)}} min={1} max={8} step={1} help="Quantidade de árvores de correção adicionadas em sequência."/>
    <ParameterField name="learning_rate" value={learningRate} onChange={setLearningRate} min={.1} max={1} step={.1} help="Tamanho do passo dado após cada árvore."/>
    <ParameterField name="max_depth" value={maxDepth} onChange={setMaxDepth} min={1} max={2} step={1} help="Quantas perguntas em sequência cada árvore pode fazer."/>
    <ParameterField name="min_samples_leaf" value={minLeaf} onChange={setMinLeaf} min={1} max={3} step={1} help="Mínimo de frutas que podem terminar numa mesma folha."/>
    <Button fullWidth startIcon={<RestartAltRoundedIcon/>} variant="outlined" onClick={()=>{setNEstimators(4);setLearningRate(.5);setMaxDepth(1);setMinLeaf(1);setRound(0);setTestIndex(0)}}>Restaurar exemplo</Button>
    <Typography fontSize={12} color="text.secondary" mt={2} lineHeight={1.7}>Os resultados do simulador são didáticos. O notebook usa a implementação oficial do scikit-learn, que pode produzir árvores e números diferentes.</Typography>
   </Box>
   <Box sx={{minWidth:0}}>
    <Typography fontWeight={850} mb={1.5}>2. Escolha a fruta de teste</Typography><Stack direction="row" gap={1} flexWrap="wrap" mb={2}>{model.testing.map((f,i)=><Button key={f.id} variant={testIndex===i?'contained':'outlined'} onClick={()=>setTestIndex(i)} size="small">Teste {i+1}: {f.color.toLowerCase()}, {f.skin.toLowerCase()}</Button>)}</Stack>
    <Typography fontWeight={850} mb={1.5}>3. Escolha a árvore de correção</Typography><Stack direction="row" flexWrap="wrap" gap={1} mb={2}>{model.rounds.map((_,i)=><Button size="small" key={i} variant={activeRound===i?'contained':'outlined'} onClick={()=>setRound(i)}>Rodada {i+1}</Button>)}</Stack>
    <NodeDiagram root={model.rounds[activeRound].tree} focus={testFruit}/><Box sx={{mt:2}}><ForestTimeline model={model} fruit={testFruit} through={activeRound+1} onSelect={setRound}/></Box><Box sx={{mt:2}}><ResidualWalkthrough model={model} roundIndex={activeRound}/></Box><Accordion disableGutters elevation={0} sx={{mt:2,border:"1px solid #DCE5F0",bgcolor:"white","&:before":{display:"none"}}}><AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>}><Typography fontWeight={850}>Por que esta rodada escolheu essa pergunta?</Typography></AccordionSummary><AccordionDetails><CandidateComparison model={model} roundIndex={activeRound}/></AccordionDetails></Accordion>
    <Box sx={{bgcolor:'#F3F7FC',p:2,mt:2}}><Typography fontWeight={850}>Como a previsão se acumula</Typography><Typography fontSize={14} mt={.5} mb={2} color="text.secondary">Resultado acumulado depois de {activeRound+1} árvore(s), para a mesma fruta:</Typography><LearningProgress model={model} fruit={testFruit} through={activeRound+1}/></Box>
    <Box sx={{mt:2}}><Typography fontWeight={850}>Como o erro de treinamento está mudando?</Typography><Box sx={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:1,mt:1}}>{model.rounds.map((r,i)=><Box key={i} sx={{border:'1px solid #DBE6F0',p:1.25,bgcolor:i===activeRound?'#EAF2FE':'#FFF'}}><Typography fontSize={11} color="text.secondary">Rodada {i+1}</Typography><Typography fontWeight={850}>{r.trainingLoss.toFixed(3)}</Typography><Typography fontSize={11} color="text.secondary">perda logística</Typography></Box>)}</Box><Typography fontSize={12} lineHeight={1.7} color="text.secondary" mt={1}>Valores menores representam menor perda nos oito exemplos de <strong>treino</strong>. Isso não garante melhor desempenho no teste; com dados pequenos, decorar padrões é um risco.</Typography></Box>
    <Box sx={{bgcolor:'#F8FAFD',p:2,mt:2}}><Typography fontWeight={850}>Experimento recomendado</Typography><Typography fontSize={14} lineHeight={1.8} mt={.5}>Compare <strong>learning_rate = 0,1</strong> e <strong>1,0</strong>, mantendo as quatro árvores. Observe o tamanho dos ajustes e a queda da perda. Depois mude <strong>max_depth</strong> de 1 para 2 e veja se aparecem mais perguntas.</Typography></Box>
   </Box>
  </Box>
 </Box>
 <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
  <Typography component="h2" fontWeight={850} fontSize={{xs:25,md:29}} mb={2}>Quando usar — e quando evitar?</Typography>
  <Box sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow><TableCell>Situação</TableCell><TableCell>Indicação</TableCell><TableCell>Por quê?</TableCell></TableRow></TableHead><TableBody>{[
   ['Dados tabulares e relações não lineares','Boa escolha','Árvores sucessivas conseguem capturar interações e melhorar a previsão gradualmente.'],
   ['Uma árvore isolada não tem desempenho suficiente','Experimente','O boosting pode corrigir erros de um modelo simples, mas o resultado precisa ser validado.'],
   ['Você quer algo rápido e com pouco ajuste','Compare alternativas','O número de árvores, taxa de aprendizado e profundidade precisam de atenção.'],
   ['Precisa explicar a decisão em poucas perguntas','Prefira Decision Tree','A soma de muitas correções não vira um único caminho curto.'],
   ['Poucos dados ou exemplos ruidosos','Cuidado','Muitas rodadas podem aprender peculiaridades e piorar a generalização.'],
  ].map(([s,label,why])=><TableRow key={s}><TableCell sx={{fontWeight:750}}>{s}</TableCell><TableCell><Chip label={label} size="small" component={label==='Prefira Decision Tree'?RouterLink:'span'} to={label==='Prefira Decision Tree'?'/tecnica/arvore-de-decisao':undefined} clickable={label==='Prefira Decision Tree'} color={label==='Boa escolha'?'success':label==='Cuidado'?'error':label==='Prefira Decision Tree'?'warning':'default'}/></TableCell><TableCell sx={{lineHeight:1.75}}>{why}</TableCell></TableRow>)}</TableBody></Table></Box>
  <Box sx={{borderLeft:'3px solid #8FAED2',pl:2.5,mt:3}}><Typography fontWeight={850}>Três jeitos de usar árvores</Typography><Typography sx={{lineHeight:1.8,mt:.5}}><Box component={RouterLink} to="/tecnica/arvore-de-decisao" sx={techniqueLinkSx}>Decision Tree</Box> aprende uma única árvore. <Box component={RouterLink} to="/tecnica/random-forest" sx={techniqueLinkSx}>Random Forest</Box> treina várias árvores em paralelo e agrega suas previsões. <strong>Gradient Boosting</strong> adiciona árvores em sequência, cada uma corrigindo a pontuação acumulada. Não existe um vencedor universal: compare o desempenho com dados reservados.</Typography><Stack direction="row" flexWrap="wrap" gap={1} mt={1}><Button component={RouterLink} to="/tecnica/arvore-de-decisao" size="small">Rever Decision Tree</Button><Button component={RouterLink} to="/tecnica/random-forest" size="small">Rever Random Forest</Button></Stack></Box>
 </Box>
 <BoostingComparison current="gradient-boosting"/>
 <CodeNotebook cells={gradientBoostingPythonCells}/>
 </Stack>
}
