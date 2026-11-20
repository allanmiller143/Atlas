import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Divider, LinearProgress, Slider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { trainAdaBoost, classifyFruit, train, test, type Fruit, type Stump, type Label } from './adaModel.ts'
import { fruitExamples } from '../decision-tree/fruitExamples.ts'
import { DataTable } from '../decision-tree/DecisionTreeLesson.tsx'
import CodeNotebook from '../../components/learning/CodeNotebook.tsx'
import { grow, TreeDiagram } from '../decision-tree/DecisionTreeFruitLab.tsx'
import { adaBoostPythonCells } from './pythonCells.ts'

const shades={apple:'#A94051',orange:'#AB6C18'}
const lessons=[
 {title:'Começamos com dez frutas',body:'Ainda não treinamos nenhuma árvore. Temos características observáveis (cor e casca) e respostas que conhecemos: maçã ou laranja.',watch:'Cada fruta tem suas pistas e seu nome correto. As respostas não foram inventadas pelo modelo.'},
 {title:'Guardamos duas frutas para o teste',body:'As oito primeiras frutas vão ensinar as árvores. As duas restantes ficam fora do treinamento e servirão para verificar se a previsão faz sentido.',watch:'A resposta do teste fica escondida para o modelo, mas nós a guardamos para conferir no fim.'},
 {title:'No início, todas têm a mesma importância',body:'O AdaBoost dá o mesmo peso às oito frutas: 1/8 para cada uma. Aqui, “peso” significa influência no treinamento — não o peso da fruta na balança.',watch:'Todas as barras de importância começam iguais. Ainda não há erro para destacar.'},
 {title:'A primeira árvore faz só uma pergunta',body:'Treinamos uma árvore pequena, com uma única pergunta. Ela procura a divisão com menor erro ponderado. Veja qual pergunta venceu e como os exemplos seguem para as duas folhas.',watch:'As folhas respondem Maçã ou Laranja. A árvore ainda pode errar: uma pergunta só nem sempre resolve todos os casos.'},
 {title:'Os erros ganham mais importância',body:'Conferimos os oito exemplos de treino. Os que a primeira árvore classificou incorretamente ganham peso relativo; os outros perdem peso relativo. Depois, normalizamos para que todos os pesos somem 100%.',watch:'Compare as barras antes e depois. A fruta difícil fica mais visível — sem mudar sua cor, textura ou resposta verdadeira.'},
 {title:'Uma nova árvore aprende com os pesos atualizados',body:'Agora treinamos OUTRA árvore. Ela recebe os mesmos exemplos, mas a distribuição de importância mudou. Por isso pode preferir outra pergunta. A primeira árvore permanece no conjunto.',watch:'Compare as perguntas das duas árvores e veja como os erros mudam. Cada nova árvore recebe os pesos que a anterior deixou.'},
 {title:'Combinamos as respostas com pesos diferentes',body:'Para uma fruta de teste, cada árvore responde Maçã ou Laranja. Árvores mais confiáveis recebem maior peso na decisão. Somamos votos com sinal: positivo favorece maçã, negativo favorece laranja.',watch:'Acompanhe o placar crescer árvore por árvore. O voto não é simplesmente “uma árvore, um voto”.'},
 {title:'Só agora conferimos a previsão final',body:'Depois de somar as contribuições, o sinal do placar produz a classificação. Conferimos o resultado com a resposta reservada do teste — ela não foi usada para ajustar as árvores.',watch:'Uma previsão correta neste exemplo não garante que o AdaBoost sempre acerte. O objetivo é compreender o processo, não provar desempenho com só duas frutas.'},
]
function Tag({label}:{label:Label}){return <Chip size="small" label={label} sx={{fontWeight:800,bgcolor:label==='Maçã'?'#F9E6E9':'#FFF0DA',color:label==='Maçã'?shades.apple:shades.orange}}/>}
function Importance({weights,previous,ids}:{weights:number[];previous?:number[];ids?:number[]}){
 return <Box sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',sm:'repeat(4,minmax(0,1fr))'},gap:1.25}}>{train.map((fruit,i)=>{
  const changed=previous?weights[i]-previous[i]:0
  const focus=ids?.includes(fruit.id)
  return <Box key={fruit.id} sx={{bgcolor:focus?'#FFF4E7':'white',border:'1px solid',borderColor:focus?'#D7A86A':'#DBE4EF',p:1.5,minWidth:0}}>
   <Typography fontSize={12} fontWeight={800}>{fruit.label} · #{fruit.id}</Typography>
   <Typography fontSize={11} color="text.secondary">Cor {fruit.color.toLowerCase()} · casca {fruit.skin.toLowerCase()}</Typography>
   <Box sx={{height:12,bgcolor:'#E5EDF5',mt:1.2,overflow:'hidden'}}><Box sx={{height:'100%',width:`${Math.min(100,weights[i]*240)}%`,bgcolor:focus?'#D18A3E':'#638EB8',transition:'width .25s'}}/></Box>
   <Stack direction="row" justifyContent="space-between" alignItems="center" mt={.7} gap={.5}><Typography fontWeight={850} fontSize={13}>{(weights[i]*100).toFixed(1)}%</Typography>{previous&&<Typography fontSize={11} color={changed>1e-9?'warning.main':'text.secondary'}>{changed>1e-9?'↑':changed< -1e-9?'↓':'='}</Typography>}</Stack>
  </Box>})}</Box>
}
/** Mesmo idioma visual dos diagramas de Decision Tree: SVG, nós com contornos e rótulos FORA dos nós. */
function OneStump({tree,index,focus}:{tree:Stump;index:number;focus?:Fruit}){
 const yes=focus?(focus[tree.question.feature]===tree.question.value):undefined
 const w=560
 return <Box sx={{minWidth:0,bgcolor:'#FAFCFF',border:'1px solid #DCE5EF',borderRadius:1,p:{xs:1,sm:1.5}}}>
  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap" mb={1}>
   <Typography fontWeight={800} fontSize={13}>Árvore {index+1}</Typography>
   <Chip size="small" variant="outlined" label={`Peso do voto: ${tree.alpha.toFixed(2)}`}/>
  </Stack>
  <Box component="svg" role="img" aria-label={`Árvore ${index+1}: ${tree.question.text}; sim: ${tree.yes}; não: ${tree.no}`} viewBox={`0 0 ${w} 230`} sx={{width:'100%',height:'auto',display:'block',maxHeight:230}}>
   <path d="M280 78 V104 H140 V142 M280 104 H420 V142" stroke="#9AB0C9" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
   {([{x:140,answer:'SIM',label:tree.yes,active:yes===true},{x:420,answer:'NÃO',label:tree.no,active:yes===false}]).map(item=><g key={item.answer}>
    <rect x={item.x-23} y="112" width="46" height="21" rx="5" fill="#FFF" stroke="#D9E3EF"/>
    <text x={item.x} y="127" textAnchor="middle" fontSize="11" fontWeight="700" fill="#355A85">{item.answer}</text>
    <rect x={item.x-104} y="142" width="208" height="66" rx="9" fill={item.label==='Maçã'?'#FCEFF0':'#FFF4E5'} stroke={item.active?'#2766B1':item.label==='Maçã'?'#D8A1A7':'#E4BD86'} strokeWidth={item.active?3:1.5}/>
    <text x={item.x} y="170" textAnchor="middle" fontSize="13" fontWeight="750" fill="#233C59">Previsão: {item.label}</text>
    {item.active&&<text x={item.x} y="190" textAnchor="middle" fontSize="11" fontWeight="700" fill="#2766B1">Caminho da fruta</text>}
   </g>)}
   <rect x="176" y="12" width="208" height="66" rx="9" fill="#E9F2FF" stroke="#83A9D7" strokeWidth="1.8"/>
   <text x="280" y="51" textAnchor="middle" fontSize="15" fontWeight="750" fill="#233C59">{tree.question.text}</text>
  </Box>
 </Box>
}
function VoteExplanation({tree}:{tree:Stump}){
 const e=tree.error, alpha=tree.alpha
 return <Box sx={{borderLeft:'3px solid #7EA8D2',pl:2,py:.5}}>
  <Typography fontWeight={800} fontSize={14}>Por que esta árvore tem peso {alpha.toFixed(2)}?</Typography>
  <Typography fontSize={13} lineHeight={1.85} mt={.5}>Ela errou exemplos que somam <strong>{(e*100).toFixed(1)}%</strong> do peso dos dados. O AdaBoost dá mais força ao voto de quem errou menos. Com erro de 50%, a árvore não tem vantagem sobre um palpite e seu peso seria zero.</Typography>
  <Typography fontSize={13} lineHeight={1.85}>A conta clássica é <code>0,5 × ln((1 − erro) / erro)</code>; multiplicamos pelo <code>learning_rate</code>. O peso é uma <strong>força de voto</strong>, não a chance de acertar nem o peso de uma fruta.</Typography>
  <Typography fontSize={13} lineHeight={1.85}>Ao prever: <strong>Maçã soma +{alpha.toFixed(2)}</strong> e <strong>Laranja soma −{alpha.toFixed(2)}</strong>. O sinal da soma final define a classe.</Typography>
 </Box>
}
function CompactVotes({model,fruit,count}:{model:ReturnType<typeof trainAdaBoost>;fruit:Fruit;count:number}){
 const result=classifyFruit(fruit,model,count)
 return <Stack gap={1.5} sx={{minWidth:0}}>
  <Box sx={{overflowX:'auto'}}><Table size="small" aria-label="Contribuição das árvores à previsão"><TableHead><TableRow><TableCell>Árvore</TableCell><TableCell>Resposta</TableCell><TableCell align="right">Força do voto</TableCell><TableCell align="right">Placar acumulado</TableCell></TableRow></TableHead><TableBody>
   {result.contributions.map(c=><TableRow key={c.index}><TableCell>{c.index}</TableCell><TableCell><Tag label={c.label}/></TableCell><TableCell align="right" sx={{fontWeight:750,color:c.delta>=0?shades.apple:shades.orange}}>{c.delta>0?'+':''}{c.delta.toFixed(2)}</TableCell><TableCell align="right">{c.score.toFixed(2)}</TableCell></TableRow>)}
  </TableBody></Table></Box>
  <Box sx={{p:1.5,bgcolor:'#EAF2FC',borderRadius:1,display:'flex',gap:1.5,justifyContent:'space-between',alignItems:'center',flexWrap:'wrap'}}><Typography fontSize={13}>Soma dos votos: <strong>{result.score.toFixed(2)}</strong></Typography><Typography fontSize={14} fontWeight={850}>Previsão: {result.label}</Typography></Box>
 </Stack>
}
export default function AdaBoostLesson(){
 const [step,setStep]=useState(0)
 const [nEstimators,setNEstimators]=useState(4)
 const [learningRate,setLearningRate]=useState(1)
 const [testIndex,setTestIndex]=useState(0)
 const [inspectRound,setInspectRound]=useState(1)
 const [lessonVoteRound,setLessonVoteRound]=useState(1)
 const model=useMemo(()=>trainAdaBoost({nEstimators,learningRate}),[nEstimators,learningRate])
 const demo=useMemo(()=>trainAdaBoost({nEstimators:4,learningRate:1}),[])
 const first=demo.trees[0]
 const second=demo.trees[1]
 const selected=test[testIndex]
 const activeRound=Math.min(inspectRound,model.trees.length)
 const current=model.trees[activeRound-1]
 return <Stack spacing={5} sx={{minWidth:0}}>
 <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
  <Typography color="primary.main" fontSize={12} letterSpacing=".09em" fontWeight={850}>EM OUTRAS PALAVRAS</Typography>
  <Typography component="h2" sx={{fontSize:{xs:23,md:30},fontWeight:850,mt:.5}}>E se o próximo aluno prestar mais atenção nas questões que o anterior errou?</Typography>
  <Typography sx={{fontSize:16,lineHeight:1.9,maxWidth:830,mt:1}}>Imagine várias árvores pequenas aprendendo a identificar frutas. A primeira erra alguns exemplos. Antes de treinar a próxima, aumentamos a importância desses exemplos difíceis. Repetimos isso e, no final, juntamos as respostas, dando pesos diferentes às árvores. Essa é a ideia do AdaBoost.</Typography>
  <Stack direction="row" gap={1} flexWrap="wrap" mt={2}><Chip component={RouterLink} to="/tecnica/arvore-de-decisao" clickable label="Rever Decision Tree" variant="outlined"/><Chip component={RouterLink} to="/tecnica/random-forest" clickable label="Comparar com Random Forest" variant="outlined"/><Chip component={RouterLink} to="/tecnica/gradient-boosting" clickable label="Comparar com Gradient Boosting" variant="outlined"/></Stack>
 </Box>
 <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
  <Typography fontSize={12} fontWeight={850} letterSpacing=".09em" color="primary.main">AULA VISUAL · {lessons.length} ETAPAS</Typography>
  <Typography component="h2" sx={{fontSize:{xs:25,md:32},fontWeight:850,mt:.8}}>Como o AdaBoost aprende com os erros?</Typography>
  <Typography sx={{lineHeight:1.8,mt:1,maxWidth:830}}>Vamos usar as frutas já conhecidas do Atlas. Nesta aula, cada classificador é uma árvore de apenas uma pergunta, chamada <strong>decision stump</strong>. Ela pode errar, e é justamente isso que move a próxima rodada.</Typography>
  <Box sx={{bgcolor:'#F3F6FB',p:{xs:2,md:3},mt:3}}>
   <Stack direction="row" gap={.75} flexWrap="wrap" mb={3}>{lessons.map((l,i)=><Button key={l.title} size="small" variant={i===step?'contained':'outlined'} onClick={()=>setStep(i)} sx={{minWidth:38,fontWeight:850}}>{i+1}</Button>)}</Stack>
   <Typography color="primary.main" fontWeight={850} fontSize={12}>ETAPA {step+1} DE {lessons.length}</Typography>
   <Typography component="h3" fontSize={{xs:20,md:24}} fontWeight={850} mt={.6}>{lessons[step].title}</Typography>
   <Typography sx={{lineHeight:1.85,mt:1,mb:3,maxWidth:870}}>{lessons[step].body}</Typography>
   {step===0&&<DataTable items={fruitExamples}/>}
   {step===1&&<Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'1.2fr 1fr'},gap:2}}><Box><Typography fontWeight={850} mb={1}>Treino · 8 frutas</Typography><DataTable items={train}/></Box><Box><Typography fontWeight={850} mb={1}>Teste · 2 frutas</Typography><DataTable items={test} hideAnswer/></Box></Box>}
   {step===2&&<><Importance weights={train.map(()=>1/train.length)}/><Alert severity="info" sx={{mt:2}}>Peso inicial de cada exemplo: 1 ÷ 8 = 0,125, ou 12,5%. Não é uma probabilidade de ser maçã.</Alert></>}
   {step===3&&first&&<Stack gap={2}><OneStump tree={first} index={0}/><Typography fontWeight={850} fontSize={14}>Qual pergunta a primeira árvore escolheu?</Typography><Box sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow><TableCell>Pergunta candidata</TableCell><TableCell align="right">Erro ponderado</TableCell></TableRow></TableHead><TableBody>{first.candidates.map(c=><TableRow key={c.text} sx={{bgcolor:c.text===first.question.text?'#EAF2FC':'transparent'}}><TableCell>{c.text}</TableCell><TableCell align="right">{(c.error*100).toFixed(1)}%</TableCell></TableRow>)}</TableBody></Table></Box><Typography fontSize={13} lineHeight={1.7}>Como os pesos ainda são iguais, cada erro custa 12,5 pontos percentuais. A melhor pergunta é a que soma menos peso dos exemplos classificados incorretamente.</Typography><VoteExplanation tree={first}/></Stack>}
   {step===3&&<Accordion disableGutters elevation={0} sx={{mt:2,border:'1px solid #DCE5EF','&:before':{display:'none'}}}><AccordionSummary expandIcon={<ExpandMoreIcon/>}><Typography fontSize={13} fontWeight={750}>E se uma árvore tivesse duas perguntas?</Typography></AccordionSummary><AccordionDetails><Typography fontSize={13} lineHeight={1.75} mb={1.5}>Uma árvore pode crescer mais de um nível. Veja uma árvore de profundidade 2 treinada com Gini nos mesmos dados. Ela é apenas uma comparação visual: <strong>as árvores do AdaBoost deste experimento continuam com uma pergunta</strong>, como no AdaBoost clássico usando decision stumps.</Typography><TreeDiagram tree={grow(train,0,2,2)} compact/></AccordionDetails></Accordion>}
   {step===4&&first&&<Stack gap={2}><Alert severity="warning">A primeira árvore errou {first.incorrect.length} fruta(s): {first.incorrect.map(id=>`#${id}`).join(', ')}. Elas recebem mais influência no próximo treinamento.</Alert><Typography fontWeight={850}>Antes · todas iguais</Typography><Importance weights={first.before}/><Typography fontWeight={850}>Depois · exemplos difíceis em destaque</Typography><Importance weights={first.after} previous={first.before} ids={first.incorrect}/><Typography fontSize={13} lineHeight={1.8}>O peso de cada exemplo é multiplicado por um fator que depende de ele ter sido classificado corretamente ou não. Depois dividimos todos os pesos pela soma, para que o total volte a 100%.</Typography></Stack>}
   {step===5&&first&&<Stack gap={2}><Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},gap:2}}><OneStump tree={first} index={0}/>{second?<OneStump tree={second} index={1}/>:<Alert severity="info">A primeira árvore acertou todos os exemplos e não foi necessária outra rodada.</Alert>}</Box>{second&&<><Typography fontSize={14} lineHeight={1.8}>A árvore 1 escolheu <strong>{first.question.text}</strong>. Com os novos pesos, a árvore 2 escolheu <strong>{second.question.text}</strong>. Ela não substitui a primeira: as duas passam a participar da decisão.</Typography><Typography fontWeight={850}>Importância dos exemplos ao iniciar a árvore 2</Typography><Importance weights={second.before} previous={first.before}/></>}</Stack>}
   {(step===6||step===7)&&<Stack gap={2}>
    <Stack direction="row" flexWrap="wrap" gap={1}>{test.map((f,i)=><Button key={f.id} variant={i===testIndex?'contained':'outlined'} size="small" onClick={()=>setTestIndex(i)}>Teste {i+1}: {f.color.toLowerCase()} · {f.skin.toLowerCase()}</Button>)}</Stack>
    <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'minmax(0,1fr) minmax(0,.95fr)'},gap:2,alignItems:'start'}}>
     <Box sx={{minWidth:0}}><Stack direction="row" gap={.6} flexWrap="wrap" alignItems="center" mb={1}><Typography fontSize={12} fontWeight={800} mr={1}>Inspecionar árvore:</Typography>{demo.trees.map((t,i)=><Button key={i} size="small" variant={lessonVoteRound===i+1?'contained':'outlined'} onClick={()=>setLessonVoteRound(i+1)}>{i+1}</Button>)}</Stack><OneStump tree={demo.trees[Math.min(lessonVoteRound,demo.trees.length)-1]} index={Math.min(lessonVoteRound,demo.trees.length)-1} focus={selected}/></Box>
     <Box sx={{minWidth:0}}><Typography fontWeight={850} fontSize={14} mb={1}>Como os votos formam a resposta?</Typography><CompactVotes model={demo} fruit={selected} count={demo.trees.length}/><Typography color="text.secondary" fontSize={12} lineHeight={1.65} mt={1}>Escolha uma árvore à esquerda para ver o caminho da fruta. A tabela mantém os votos de todas as árvores para você enxergar a soma.</Typography></Box>
    </Box>
    {step===7&&<Alert severity={classifyFruit(selected,demo).label===selected.label?'success':'warning'}>Resposta correta (guardada no teste): <strong>{selected.label}</strong>. Previsão da floresta: <strong>{classifyFruit(selected,demo).label}</strong>.</Alert>}
    <Accordion disableGutters elevation={0} sx={{border:'1px solid #DCE5EF','&:before':{display:'none'}}}><AccordionSummary expandIcon={<ExpandMoreIcon/>}><Typography fontSize={13} fontWeight={750}>Entenda matematicamente o peso de cada voto</Typography></AccordionSummary><AccordionDetails>{demo.trees.map((t,i)=><Box key={i} sx={{mb:2}}><VoteExplanation tree={t}/></Box>)}</AccordionDetails></Accordion>
   </Stack>}
   <Box sx={{borderTop:'1px solid #D7E2F0',pt:2,mt:3}}><Typography fontSize={13} fontWeight={850} color="primary.dark">O QUE OBSERVAR</Typography><Typography fontSize={14} lineHeight={1.75} mt={.5}>{lessons[step].watch}</Typography></Box>
   <Stack direction="row" gap={1} justifyContent="space-between" mt={3}><Button startIcon={<ArrowBackRoundedIcon/>} disabled={step===0} onClick={()=>setStep(i=>Math.max(0,i-1))}>Anterior</Button><Button variant="contained" endIcon={<ArrowForwardRoundedIcon/>} onClick={()=>setStep(i=>i===lessons.length-1?0:i+1)}>{step===lessons.length-1?'Recomeçar':'Próxima etapa'}</Button></Stack>
   <LinearProgress variant="determinate" value={(step+1)*100/lessons.length} sx={{mt:2,height:4}}/>
  </Box>
 </Box>
 <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
  <Typography component="h2" fontSize={{xs:24,md:30}} fontWeight={850}>Quais parâmetros você pode ajustar?</Typography>
  <Typography sx={{lineHeight:1.8,maxWidth:790,mt:1,mb:2}}>Os parâmetros controlam quantas árvores tentamos treinar e o quanto cada árvore influencia a seguinte. Não alteram as respostas verdadeiras das frutas.</Typography>
  <Box sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow><TableCell>Parâmetro</TableCell><TableCell>O que significa</TableCell><TableCell>Faixa da aula</TableCell></TableRow></TableHead><TableBody>{[
   ['n_estimators','Número máximo de classificadores simples treinados em sequência.','1–8'],
   ['learning_rate','Intensidade do peso de cada árvore; também afeta quanto mudam os pesos dos exemplos.','0,2–1,5'],
   ['estimator','Modelo fraco usado a cada rodada. Neste laboratório é uma árvore de uma divisão (max_depth=1); o desenho opcional de profundidade 2 é apenas ilustrativo.','Decision stump'],
  ].map(r=><TableRow key={r[0]}>{r.map((v,i)=><TableCell key={i} sx={{verticalAlign:'top',py:1.5}}>{i===0?<code>{v}</code>:v}</TableCell>)}</TableRow>)}</TableBody></Table></Box>
 </Box>
 <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
  <Typography component="h2" fontSize={{xs:24,md:30}} fontWeight={850}>Experimente o AdaBoost</Typography>
  <Typography sx={{lineHeight:1.8,maxWidth:800,mt:1}}>Escolha quantas árvores treinar, inspecione uma rodada por vez e veja, lado a lado, a árvore, os pesos das oito frutas e o placar de votos. Os controles recalculam o modelo didático.</Typography>
  <Box sx={{bgcolor:'#F3F6FB',p:{xs:2,md:3},mt:2}}>
   <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},gap:3}}>
    <Box><Stack direction="row" justifyContent="space-between"><Typography fontWeight={850}>n_estimators</Typography><Typography fontWeight={850}>{nEstimators}</Typography></Stack><Slider value={nEstimators} min={1} max={8} step={1} marks onChange={(_,v)=>setNEstimators(v as number)}/><Typography fontSize={12} color="text.secondary">Máximo de árvores que podem participar da resposta.</Typography></Box>
    <Box><Stack direction="row" justifyContent="space-between"><Typography fontWeight={850}>learning_rate</Typography><Typography fontWeight={850}>{learningRate.toFixed(1)}</Typography></Stack><Slider value={learningRate} min={0.2} max={1.5} step={0.1} onChange={(_,v)=>setLearningRate(v as number)}/><Typography fontSize={12} color="text.secondary">Quanto a contribuição de cada árvore influencia a próxima rodada.</Typography></Box>
   </Box>
   <Divider sx={{my:2}}/>
   <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" mb={1.5}>
    <Chip size="small" label={`${model.trees.length} árvore(s) treinada(s)`} color="primary" variant="outlined"/>
    <Typography fontSize={13} fontWeight={750}>Rodada:</Typography>
    {model.trees.map((t,i)=><Button key={i} size="small" variant={activeRound===i+1?'contained':'outlined'} onClick={()=>setInspectRound(i+1)}>{i+1}</Button>)}
    <Box sx={{flexGrow:1}}/>
    {test.map((f,i)=><Button key={f.id} size="small" variant={i===testIndex?'contained':'outlined'} onClick={()=>setTestIndex(i)}>Teste {i+1} · {f.color.toLowerCase()}</Button>)}
   </Stack>
   {model.trees.length>0&&<Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'minmax(0,1fr) minmax(0,1fr)'},gap:2,alignItems:'start'}}>
    <Box sx={{minWidth:0}}>
     <OneStump tree={current??model.trees[0]} index={activeRound-1} focus={selected}/>
     <Typography fontSize={12} color="text.secondary" mt={1.2}>A fruta percorre a árvore selecionada. A folha informa a classe; o peso do voto determina a força dessa resposta.</Typography>
    </Box>
    <Box sx={{minWidth:0}}>
     <Typography fontSize={14} fontWeight={850} mb={1}>Como mudaram os pesos das frutas?</Typography>
     <Box sx={{overflowX:'auto',maxHeight:254,overflowY:'auto',border:'1px solid #DCE5EF',bgcolor:'white'}}><Table size="small" stickyHeader><TableHead><TableRow><TableCell>Fruta</TableCell><TableCell align="right">Antes</TableCell><TableCell align="right">Depois</TableCell><TableCell align="center">Mudança</TableCell></TableRow></TableHead><TableBody>{train.map((fruit,i)=>{const t=current??model.trees[0],d=t.after[i]-t.before[i];return <TableRow key={fruit.id} sx={{bgcolor:t.incorrect.includes(fruit.id)?'#FFF4E7':'transparent'}}><TableCell sx={{fontSize:12}}>#{fruit.id} · {fruit.color.toLowerCase()} · {fruit.label}</TableCell><TableCell align="right">{(t.before[i]*100).toFixed(1)}%</TableCell><TableCell align="right" sx={{fontWeight:750}}>{(t.after[i]*100).toFixed(1)}%</TableCell><TableCell align="center" sx={{color:d>1e-8?'#A46116':'text.secondary'}}>{d>1e-8?'↑':d< -1e-8?'↓':'='}</TableCell></TableRow>})}</TableBody></Table></Box>
     <Typography fontSize={12} mt={1} color="text.secondary">Linhas destacadas: frutas erradas nessa rodada. Pesos maiores influenciam mais a próxima árvore.</Typography>
    </Box>
   </Box>}
   <Box sx={{mt:2}}><Typography fontSize={14} fontWeight={850} mb={1}>Previsão da fruta selecionada</Typography><CompactVotes model={model} fruit={selected} count={model.trees.length}/></Box>
   {model.trees.length>0&&<Accordion disableGutters elevation={0} sx={{mt:2,border:'1px solid #DCE5EF','&:before':{display:'none'}}}><AccordionSummary expandIcon={<ExpandMoreIcon/>}><Typography fontWeight={750} fontSize={13}>Como foi calculado o peso do voto desta árvore?</Typography></AccordionSummary><AccordionDetails><VoteExplanation tree={current??model.trees[0]}/></AccordionDetails></Accordion>}
   <Alert severity="info" sx={{mt:2}}>Experimento recomendado: compare 1 e 4 árvores. Depois altere learning_rate. Mais rodadas não garantem sempre uma resposta melhor, especialmente quando há ruído ou poucos exemplos.</Alert>
  </Box>
 </Box>
 <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
  <Typography component="h2" fontSize={{xs:24,md:30}} fontWeight={850}>Quando usar — e quando evitar</Typography>
  <Box sx={{overflowX:'auto',mt:2}}><Table size="small"><TableHead><TableRow><TableCell>Situação</TableCell><TableCell>Indicação</TableCell><TableCell>Por quê?</TableCell></TableRow></TableHead><TableBody>{[
   ['Você quer combinar vários classificadores simples','Pode ser útil','O AdaBoost forma uma decisão ponderada a partir de modelos fracos.','success'],
   ['A base é pequena e relativamente limpa','Pode funcionar bem','É possível aprender progressivamente com erros de classificação.','success'],
   ['Os dados têm muitos rótulos incorretos ou casos extremos','Tenha cuidado','Exemplos errados podem receber peso alto e atrair atenção excessiva.','warning'],
   ['Você precisa justificar cada previsão com uma única regra','Considere outra abordagem','O conjunto de várias árvores é menos direto que uma árvore isolada.','warning'],
   ['Você trabalha com regressão ou multiclasse','Exige outra variante','A aula demonstra AdaBoost binário com stumps; outras variantes têm formulações próprias.','info'],
  ].map(r=><TableRow key={r[0]}><TableCell sx={{verticalAlign:'top'}}>{r[0]}</TableCell><TableCell sx={{verticalAlign:'top'}}><Chip label={r[1]} size="small" color={r[3] as 'success'|'warning'|'info'} variant="outlined"/></TableCell><TableCell sx={{verticalAlign:'top'}}>{r[2]}</TableCell></TableRow>)}</TableBody></Table></Box>
 </Box>
 <CodeNotebook cells={adaBoostPythonCells}/>
 </Stack>
}
