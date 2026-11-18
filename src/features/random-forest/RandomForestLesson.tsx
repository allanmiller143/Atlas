import { useMemo, useState } from 'react'
import { Box, Button, Chip, Collapse, Divider, LinearProgress, Slider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import { Link as RouterLink } from 'react-router-dom'
import { DataTable } from '../decision-tree/DecisionTreeLesson.tsx'
import { fruitExamples } from '../decision-tree/fruitExamples.ts'
import CodeNotebook from '../../components/learning/CodeNotebook.tsx'
import { randomForestPythonCells } from './pythonCells.ts'
import { train, test, forestFromTraining, classify } from './forestModel.ts'
import type { Branch, Fruit, Label } from './forestModel.ts'

const ink='#253F5C'
const apple='#A93E4A',orange='#A86D19'
const lessons=[
 {title:'Começamos com o conjunto completo',body:'Primeiro temos dez frutas, cada uma com duas características (cor e textura) e a resposta correta. Ainda não há treino, teste ou árvores: só exemplos que queremos usar para ensinar e avaliar.',watch:'Repare nas dez frutas juntas. Características são as entradas; maçã ou laranja é a resposta que o algoritmo tentará prever.'},
 {title:'Separamos treino e teste',body:'Guardamos duas frutas (20%) para conferir depois. As outras oito (80%) podem ser usadas para construir a floresta. As duas frutas de teste não entram nos sorteios nem ensinam perguntas às árvores.',watch:'A mudança é a separação dos papéis: oito exemplos ensinam, dois servem para avaliar. Ainda não houve treinamento.'},
 {title:'Cada árvore recebe uma amostra bootstrap',body:'Para treinar cada árvore, sorteamos oito frutas a partir do treino, com reposição. Uma mesma fruta pode sair mais de uma vez e outra pode não aparecer. Cada árvore começa, portanto, com uma versão diferente do treino.',watch:'Compare as três listas. Uma ID repetida significa que a mesma fruta foi sorteada mais de uma vez; isso não representa uma fruta nova.'},
 {title:'Cada árvore escolhe suas perguntas com Gini',body:'Assim como na Decision Tree, cada árvore avalia perguntas e procura reduzir a mistura de classes (impureza de Gini). Só que faz isso com sua própria amostra bootstrap. Além disso, em cada nó o Random Forest sorteia quais características podem competir. Com max_features = 1, olha cor OU textura naquele nó, não as duas.',watch:'Olhe a impureza antes e depois da primeira pergunta de cada árvore. Os valores e as perguntas podem ser diferentes porque os exemplos sorteados e as características disponíveis também diferem. Depois veja as árvores que nasceram dessas escolhas.'},
 {title:'Uma fruta percorre todas as árvores',body:'Agora pegamos uma fruta que ficou no teste. Ela percorre as perguntas de cada árvore. Como elas não aprenderam necessariamente as mesmas regras, podem seguir caminhos diferentes e até dar respostas diferentes.',watch:'O exemplo é exatamente o mesmo para todas as árvores. Observe qual caminho fica destacado em cada desenho e compare as respostas individuais.'},
 {title:'A floresta combina as previsões',body:'Na demonstração, contamos os votos das árvores: a classe com mais votos é a previsão coletiva. Só então revelamos a resposta correta reservada para teste. Conferir o teste não muda as árvores já treinadas.',watch:'Mais árvores não significa certeza de acerto. Esta votação é uma simplificação: o RandomForestClassifier do scikit-learn combina probabilidades estimadas pelas árvores, o que pode diferir da maioria simples.'},
]

function LabelTag({label}:{label:Label}){return <Chip size="small" label={label} sx={{fontWeight:750,color:label==='Maçã'?apple:orange,bgcolor:label==='Maçã'?'#FAE7E9':'#FFF0D5'}}/>}
function FruitChip({fruit,showLabel=true,small=false}:{fruit:Fruit;showLabel?:boolean;small?:boolean}){
 return <Box sx={{border:'1px solid #DFE6EF',bgcolor:'#FFF',px:small?1:1.4,py:small?.75:1.2,minWidth:small?94:122,flex:'0 0 auto',borderRadius:1}}>
  <Stack direction="row" gap={.6} alignItems="center"><Box sx={{width:12,height:12,borderRadius:'50%',bgcolor:fruit.color==='Vermelha'?'#D56169':fruit.color==='Esverdeada'?'#83B073':fruit.color==='Alaranjada'?'#E3A353':'#E8C466',border:'1px solid #B9A99B'}}/><Typography fontSize={small?11:12} fontWeight={750}>#{fruit.id} {fruit.color.toLowerCase()}</Typography></Stack>
  <Typography fontSize={11} color="text.secondary" mt={.25}>{fruit.skin.toLowerCase()}</Typography>
  {showLabel?<Typography fontSize={11} mt={.55} fontWeight={850} color={fruit.label==='Maçã'?apple:orange}>{fruit.label}</Typography>:<Typography fontSize={11} mt={.55} color="text.secondary">Resposta oculta</Typography>}
 </Box>
}
function TreeSketch({root,focus,small=false}:{root:Branch;focus?:Fruit;small?:boolean}){
 type Placed={branch:Branch;x:number;y:number;depth:number}
 const nodes:Placed[]=[];const links:{from:Placed;to:Placed;answer:string}[]=[];let nextLeaf=0
 const position=(branch:Branch,depth:number):Placed=>{
  let left:Placed|undefined,right:Placed|undefined
  if(branch.yes&&branch.no){left=position(branch.yes,depth+1);right=position(branch.no,depth+1)}
  const x=left&&right?(left.x+right.x)/2:100+nextLeaf++*190
  const current={branch,x,y:30+depth*116,depth};nodes.push(current)
  if(left&&right){links.push({from:current,to:left,answer:'SIM'},{from:current,to:right,answer:'NÃO'})}
  return current
 }
 position(root,0)
 const width=Math.max(390,nextLeaf*190+10),height=Math.max(...nodes.map(n=>n.y))+90
 const highlighted=new Set<Branch>();if(focus){let node=root;highlighted.add(node);while(node.key&&node.value&&node.yes&&node.no){node=focus[node.key]===node.value?node.yes:node.no;highlighted.add(node)}}
 return <Box sx={{overflowX:'auto',bgcolor:'#F8FBFF',border:'1px solid #DFE7F1',borderRadius:1.5,p:1.25}}>
  <Box component="svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Árvore individual treinada a partir de amostra sorteada" sx={{display:'block',width:'100%',minWidth:small?270:360,maxHeight:small?310:430}}>
   {links.map((edge,i)=>{const active=focus&&highlighted.has(edge.from.branch)&&highlighted.has(edge.to.branch);const mid=(edge.from.y+73+edge.to.y)/2;return <g key={i}><path d={`M${edge.from.x} ${edge.from.y+72} V${mid} H${edge.to.x} V${edge.to.y}`} fill="none" stroke={active?'#3173BF':'#A6B9D0'} strokeWidth={active?3.7:2}/><rect x={edge.to.x-19} y={edge.to.y-22} width="38" height="18" rx="4" fill="white" stroke="#DAE4EE"/><text x={edge.to.x} y={edge.to.y-9} textAnchor="middle" fontSize="10" fill="#3B5D85">{edge.answer}</text></g>})}
   {nodes.map((n,i)=>{const a=n.branch.samples.filter(f=>f.label==='Maçã').length;const b=n.branch.samples.length-a;return <g key={i}><rect x={n.x-86} y={n.y} width="172" height="72" rx="9" fill={n.branch.question?'#E9F2FF':n.branch.label==='Maçã'?'#FDECEF':'#FFF1D9'} stroke={highlighted.has(n.branch)?'#2672C0':'#B9CADC'} strokeWidth={highlighted.has(n.branch)?3:1.4}/><text x={n.x} y={n.y+28} textAnchor="middle" fill={ink} fontSize="13" fontWeight="700">{n.branch.question??`Prevê: ${n.branch.label}`}</text><text x={n.x} y={n.y+51} textAnchor="middle" fill="#61748C" fontSize="11">{a} maçã(s) · {b} laranja(s)</text></g>})}
  </Box>
 </Box>
}
function DataOverview({split=false}:{split?:boolean}){return <Box><Typography fontWeight={850} mb={1}>{split?'Separando 10 frutas em treino e teste':'Conjunto completo · 10 frutas'}</Typography>{!split?<><DataTable items={fruitExamples}/><Typography fontSize={13} mt={1.5} lineHeight={1.7} color="text.secondary">Todas estão juntas. Ainda não escolhemos quais vão ensinar o modelo e quais vão conferir o aprendizado.</Typography></>:<Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1.15fr 1fr'},gap:2}}><Box><Typography fontWeight={850} sx={{mb:1}}>Treino · 8 frutas (80%)</Typography><DataTable items={train}/></Box><Box><Typography fontWeight={850} sx={{mb:1}}>Teste · 2 frutas (20%)</Typography><DataTable items={test} hideAnswer/><Typography fontSize={13} lineHeight={1.7} color="text.secondary" mt={1}>As respostas do teste ficam guardadas e nunca participam dos sorteios bootstrap.</Typography></Box></Box>}</Box>}
function gini(items:Fruit[]){if(!items.length)return 0;const apples=items.filter(f=>f.label==='Maçã').length;const p=apples/items.length;return 1-p*p-(1-p)*(1-p)}
function GiniTrees({trees}:{trees:ReturnType<typeof forestFromTraining>['trees']}){
 return <Stack gap={3}>
  <Box sx={{borderLeft:'3px solid #7AA0CE',pl:2,py:.5}}><Typography fontWeight={850} fontSize={14}>Como é escolhida uma pergunta?</Typography><Typography fontSize={13} lineHeight={1.8} mt={.5}>Gini mede a mistura de maçãs e laranjas em um grupo: <strong>0</strong> significa que todas são da mesma classe. Para cada pergunta permitida, a árvore calcula a mistura dos dois grupos resultantes e escolhe a maior redução. Isso se repete nos ramos até que parem de dividir.</Typography></Box>
  <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'repeat(3,minmax(0,1fr))'},gap:1.5}}>{trees.slice(0,3).map((tree,i)=>{
   const root=tree.root;const before=gini(root.samples);const after=root.yes&&root.no?(root.yes.samples.length*gini(root.yes.samples)+root.no.samples.length*gini(root.no.samples))/root.samples.length:before
   return <Box key={i} sx={{border:'1px solid #DCE5EF',bgcolor:'#FFF',p:2,minWidth:0}}><Typography fontWeight={850} fontSize={14}>Árvore {i+1}</Typography><Typography fontSize={12} color="text.secondary" mt={.5}>Amostra: {root.samples.length} sorteios · {new Set(root.samples.map(f=>f.id)).size} frutas distintas</Typography><Typography fontSize={14} fontWeight={800} mt={1.5}>{root.question??'Sem divisão possível'}</Typography><Stack direction="row" flexWrap="wrap" gap={.7} mt={1}><Chip size="small" variant="outlined" label={`Gini inicial: ${before.toFixed(3)}`}/><Chip size="small" color={root.question?'success':'default'} label={`Após dividir: ${after.toFixed(3)}`}/></Stack><Typography fontSize={12} color="text.secondary" lineHeight={1.65} mt={1}>Redução de Gini: <strong>{(before-after).toFixed(3)}</strong>. {root.question?'A pergunta escolhida reduz a mistura dessa amostra.':'Nenhuma pergunta disponível conseguiu reduzir a mistura.'}</Typography></Box>
  })}</Box>
  <Typography fontSize={13} color="text.secondary" lineHeight={1.7}>Com <strong>max_features = 1</strong>, a árvore só compara perguntas de uma característica sorteada em cada nó. Portanto, a escolha é a melhor entre as opções disponíveis naquele nó, não necessariamente entre todas as características dos dados.</Typography>
  <TreeCollection trees={trees}/>
 </Stack>
}

function BootstrapView({samples}:{samples:Fruit[][]}){return <Box><Typography fontSize={15} fontWeight={850} mb={1.5}>Três sorteios feitos a partir das mesmas oito frutas</Typography><Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'repeat(3,minmax(0,1fr))'},gap:2}}>{samples.slice(0,3).map((items,i)=><Box key={i} sx={{bgcolor:'#F3F7FC',p:2,minWidth:0}}><Typography fontWeight={850} fontSize={14}>Árvore {i+1} · amostra {i+1}</Typography><Typography color="text.secondary" fontSize={12} my={1}>Oito sorteios; repetição permitida</Typography><Stack gap={.6}>{items.map((f,j)=><Stack key={j} direction="row" alignItems="center" justifyContent="space-between" sx={{borderBottom:'1px solid #DBE5F1',py:.4}}><Typography fontSize={12}>Sorteio {j+1}</Typography><Typography fontWeight={750} fontSize={12}>Fruta #{f.id} · {f.label}</Typography></Stack>)}</Stack><Typography color="text.secondary" fontSize={12} mt={1.5}>Frutas únicas: {new Set(items.map(f=>f.id)).size} de 8</Typography></Box>)}</Box></Box>}
function TreeCollection({trees,focus,limit=3}:{trees:ReturnType<typeof forestFromTraining>['trees'];focus?:Fruit;limit?:number}){return <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'repeat(3,minmax(0,1fr))'},gap:2}}>{trees.slice(0,limit).map((tree,i)=><Box key={i} sx={{minWidth:0}}><Typography fontSize={14} fontWeight={850} mb={1}>Árvore {i+1} {focus&&'· caminho destacado'}</Typography><TreeSketch root={tree.root} focus={focus} small/></Box>)}</Box>}
function VotesView({model,showTruth=false}:{model:ReturnType<typeof forestFromTraining>;showTruth?:boolean}){const apples=model.votes.filter(v=>v==='Maçã').length;const oranges=model.votes.length-apples;return <Box><Typography fontSize={15} fontWeight={850} mb={1.5}>Todas as árvores recebem a mesma fruta de teste</Typography><Box sx={{mb:2}}><FruitChip fruit={model.test} showLabel={showTruth}/></Box><Box sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',sm:'repeat(3,minmax(0,1fr))'},gap:1.5}}>{model.votes.map((vote,i)=><Box key={i} sx={{p:1.5,border:'1px solid #DCE6F0',bgcolor:'#FBFCFF'}}><Typography fontSize={12} color="text.secondary">Árvore {i+1}</Typography><Box mt={1}><LabelTag label={vote}/></Box></Box>)}</Box>{showTruth&&<Box sx={{borderTop:'1px solid #D9E4EF',mt:3,pt:2}}><Typography fontWeight={850}>Resultado da floresta</Typography><Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} mt={1.5}><Chip label={`${apples} voto(s) para maçã`} variant="outlined"/><Chip label={`${oranges} voto(s) para laranja`} variant="outlined"/><LabelTag label={model.winner}/><Chip color={model.winner===model.test.label?'success':'warning'} label={model.winner===model.test.label?'Previsão correta':'Previsão incorreta'}/></Stack><Typography sx={{mt:1.5,fontSize:13,color:'text.secondary',lineHeight:1.7}}>Este é um voto majoritário didático. O RandomForestClassifier do scikit-learn combina probabilidades das árvores; a decisão pode divergir de uma simples contagem de votos.</Typography></Box>}</Box>}
export default function RandomForestLesson(){
 const [step,setStep]=useState(0),[seed,setSeed]=useState(7),[nEstimators,setNEstimators]=useState(3),[maxDepth,setMaxDepth]=useState(2),[maxFeatures,setMaxFeatures]=useState(1),[testIndex,setTestIndex]=useState(0),[expand,setExpand]=useState(false)
 const model=useMemo(()=>forestFromTraining({nEstimators,maxDepth,maxFeatures,seed,testIndex}),[nEstimators,maxDepth,maxFeatures,seed,testIndex])
 const firstThree=useMemo(()=>forestFromTraining({nEstimators:3,maxDepth:2,maxFeatures:1,seed:7,testIndex}),[testIndex])
 return <Stack spacing={5} sx={{minWidth:0}}>
  <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
   <Typography fontSize={12} fontWeight={850} letterSpacing=".1em" color="primary.main">AULA VISUAL · 6 ETAPAS</Typography>
   <Typography component="h2" sx={{fontSize:{xs:25,md:32},fontWeight:850,mt:.7}}>Por que treinar várias árvores?</Typography>
   <Typography sx={{maxWidth:800,lineHeight:1.85,mt:1}}>Uma Decision Tree aprende uma sequência de perguntas. Mas e se ela decidir com base em um conjunto de exemplos pouco representativo? A Random Forest treina várias árvores com sorteios diferentes e combina suas previsões. Vamos ver esse processo nascer, usando as mesmas frutas da aula anterior.</Typography>
   <Box sx={{bgcolor:'#F3F6FB',p:{xs:2,md:3},mt:3}}>
    <Stack direction="row" gap={.8} flexWrap="wrap" sx={{mb:3}}>{lessons.map((l,i)=><Button key={l.title} variant={i===step?'contained':'outlined'} size="small" onClick={()=>setStep(i)} aria-current={i===step?'step':undefined} sx={{minWidth:42,fontWeight:850}}>{i+1}</Button>)}</Stack>
    <Typography fontSize={12} color="primary.main" fontWeight={850}>ETAPA {step+1} DE {lessons.length}</Typography>
    <Typography component="h3" fontSize={{xs:19,md:23}} fontWeight={850} mt={.6}>{lessons[step].title}</Typography>
    <Typography sx={{lineHeight:1.8,maxWidth:860,mt:1,mb:3}}>{lessons[step].body}</Typography>
    {step===0&&<DataOverview/>}
    {step===1&&<DataOverview split/>}
    {step===2&&<BootstrapView samples={firstThree.trees.map(t=>t.sample)}/>}
    {step===3&&<GiniTrees trees={firstThree.trees}/>}
    {step===4&&<><TreeCollection trees={firstThree.trees} focus={firstThree.test}/><Box sx={{mt:2}}><VotesView model={firstThree}/></Box></>}
    {step===5&&<><Stack direction="row" gap={1} flexWrap="wrap" mb={2}>{test.map((f,i)=><Button key={f.id} size="small" variant={testIndex===i?'contained':'outlined'} onClick={()=>setTestIndex(i)}>Teste {i+1}: {f.color.toLowerCase()}, {f.skin.toLowerCase()}</Button>)}</Stack><VotesView model={firstThree} showTruth/></>}
    <Box sx={{mt:2.5,pt:2,borderTop:'1px solid #D7E2F0'}}><Typography fontSize={13} fontWeight={850} color="primary.dark">O QUE OBSERVAR</Typography><Typography sx={{mt:.5,lineHeight:1.75,fontSize:14}}>{lessons[step].watch}</Typography></Box>
    <Stack direction="row" gap={1} justifyContent="space-between" sx={{mt:3}}><Button startIcon={<ArrowBackRoundedIcon/>} disabled={step===0} onClick={()=>setStep(x=>Math.max(0,x-1))}>Anterior</Button><Button variant="contained" endIcon={<ArrowForwardRoundedIcon/>} onClick={()=>setStep(x=>x===lessons.length-1?0:x+1)}>{step===lessons.length-1?'Recomeçar':'Próxima etapa'}</Button></Stack><LinearProgress variant="determinate" value={(step+1)*100/lessons.length} sx={{mt:2,height:4,borderRadius:0}}/>
   </Box>
  </Box>
  <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
   <Typography component="h2" fontWeight={850} sx={{fontSize:{xs:24,md:29},mb:1}}>Quais parâmetros você pode ajustar?</Typography>
   <Typography sx={{lineHeight:1.8,color:'text.secondary',maxWidth:800,mb:2}}>Parâmetro é uma escolha feita <strong>antes ou durante o treinamento</strong> que controla como o algoritmo aprende. Ele não é a mesma coisa que uma regra que a árvore descobre a partir dos dados.</Typography>
   <Box sx={{overflowX:'auto'}}><Table size="small" sx={{'& td, & th':{verticalAlign:'top',py:1.5}}}><TableHead><TableRow><TableCell sx={{minWidth:170}}>Parâmetro</TableCell><TableCell>O que muda</TableCell><TableCell sx={{minWidth:100}}>Valores disponíveis</TableCell><TableCell>Padrão</TableCell></TableRow></TableHead><TableBody>{[
    ['n_estimators','Número de árvores. Mais árvores significa mais previsões combinadas, mas também mais processamento.','1 até 9 (ímpares)','3'],
    ['max_depth','Limite de perguntas consecutivas por árvore. Árvores rasas aprendem regras mais simples.','1 até 3','2'],
    ['max_features','Número de características disponíveis em cada nó: com 1, considera cor OU casca; com 2, ambas.','1 até 2','1'],
    ['random_state','Semente para repetir os sorteios de amostras e características. Não altera as respostas corretas.','1 até 20','7'],
   ].map(([name,what,range,defaultValue])=><TableRow key={name}><TableCell sx={{fontWeight:800,fontFamily:'monospace'}}>{name}</TableCell><TableCell sx={{lineHeight:1.75}}>{what}</TableCell><TableCell>{range}</TableCell><TableCell>{defaultValue}</TableCell></TableRow>)}</TableBody></Table></Box>
   <Box sx={{bgcolor:'#F2F6FB',p:2.5,mt:2}}><Typography fontWeight={850}>Experimento recomendado: max_features</Typography><Typography sx={{mt:.5,lineHeight:1.8}}>Faça assim: mantenha a mesma semente e compare <strong>max_features = 1</strong> e <strong>2</strong>. Depois experimente trocar <strong>random_state</strong>.</Typography><Typography color="text.secondary" sx={{mt:.5,lineHeight:1.8}}>O que observar: quais perguntas aparecem nas árvores, como suas estruturas variam e se os votos mudam. Nem toda alteração de parâmetro precisa mudar a previsão.</Typography></Box>
  </Box>
  <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
   <Typography component="h2" fontWeight={850} fontSize={{xs:25,md:30}}>Experimente a Random Forest</Typography>
   <Typography sx={{lineHeight:1.8,maxWidth:800,mt:1,mb:2}}>Aqui não usamos o gráfico de bolinhas: cada controle refaz o sorteio e o treinamento com as <strong>oito frutas da aula</strong>. Selecione uma fruta de teste e observe como as árvores e seus votos mudam.</Typography>
   <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'275px minmax(0,1fr)'},gap:3,alignItems:'start'}}>
    <Box sx={{p:2.5,bgcolor:'#F3F6FA'}}>
     <Typography fontWeight={850} fontSize={15} mb={2}>1. Ajuste o treinamento</Typography>
     {[
      {name:'n_estimators',value:nEstimators,set:setNEstimators,min:1,max:9,step:2,description:'Quantidade de árvores que votam.'},
      {name:'max_depth',value:maxDepth,set:setMaxDepth,min:1,max:3,step:1,description:'Quantas perguntas uma árvore pode encadear.'},
      {name:'max_features',value:maxFeatures,set:setMaxFeatures,min:1,max:2,step:1,description:'Quantas características podem ser examinadas em cada pergunta.'},
      {name:'random_state',value:seed,set:setSeed,min:1,max:20,step:1,description:'Muda os sorteios, não as respostas certas.'},
     ].map(p=><Box key={p.name} sx={{mb:2.5}}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontSize={13} fontWeight={750}>{p.name}</Typography><Chip size="small" label={p.value}/></Stack><Typography fontSize={12} color="text.secondary" sx={{mt:.7,lineHeight:1.6}}>{p.description}</Typography><Slider value={p.value} min={p.min} max={p.max} step={p.step} marks onChange={(_,v)=>p.set(v as number)} aria-label={p.name}/></Box>)}
     <Button variant="outlined" fullWidth startIcon={<RestartAltRoundedIcon/>} onClick={()=>{setSeed(7);setNEstimators(3);setMaxDepth(2);setMaxFeatures(1);setTestIndex(0);setExpand(false)}}>Restaurar exemplo</Button>
     <Typography color="text.secondary" fontSize={12} lineHeight={1.7} mt={2}>As árvores desta simulação categórica são calculadas no navegador. É uma implementação simplificada para o ensino, não o RandomForestClassifier completo.</Typography>
    </Box>
    <Box sx={{minWidth:0}}>
     <Typography fontWeight={850} fontSize={16} mb={1.5}>1. Escolha a fruta que será prevista</Typography>
     <Stack direction="row" gap={1} flexWrap="wrap" mb={2}>{test.map((f,i)=><Button size="small" variant={testIndex===i?'contained':'outlined'} key={f.id} onClick={()=>setTestIndex(i)}>Teste {i+1}: {f.color.toLowerCase()}, {f.skin.toLowerCase()}</Button>)}</Stack>
     <Typography fontWeight={850} fontSize={16} mb={1.5}>2. Veja as árvores treinadas</Typography><Typography fontSize={13} color="text.secondary" lineHeight={1.7} mb={2}>As cores são características de entrada. O modelo pode perguntar pela <strong>cor</strong> (por exemplo, "Cor vermelha?" ou "Cor esverdeada?") ou pela <strong>textura</strong> ("Casca lisa?"). Cada árvore só exibe as perguntas que escolheu: nem toda cor precisa aparecer em seus ramos. Por exemplo, na pergunta “Cor vermelha?”, o ramo SIM recebe as vermelhas e o ramo NÃO recebe todas as demais cores. O modelo não precisa criar uma pergunta para cada cor.</Typography>
     <TreeCollection trees={model.trees} focus={model.test}/>
     {model.trees.length>3&&<><Button size="small" sx={{mt:1.5}} onClick={()=>setExpand(x=>!x)}>{expand?'Ocultar outras árvores':`Mostrar as outras ${model.trees.length-3} árvores`}</Button><Collapse in={expand}><Box sx={{mt:2}}><TreeCollection trees={model.trees.slice(3)} focus={model.test} limit={model.trees.length}/></Box></Collapse></>}
     <Divider sx={{my:3}}/>
     <Typography fontWeight={850} fontSize={16} mb={1}>3. Veja os votos e a previsão final</Typography>
     <VotesView model={model} showTruth/>
     <Typography fontSize={13} mt={2} lineHeight={1.7} color="text.secondary">Acertos nos {test.length} exemplos de teste: {Math.round(model.accuracy*test.length)} de {test.length}. Essa amostra é pequena demais para avaliar um modelo real. Ela existe aqui para ajudar a entender o processo.</Typography>
    </Box>
   </Box>
  </Box>
  <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}>
   <Typography component="h2" fontWeight={850} fontSize={{xs:25,md:30}} mb={1.5}>Quando usar — e quando evitar?</Typography>
   <Table size="small"><TableHead><TableRow><TableCell>Situação</TableCell><TableCell>Indicação</TableCell><TableCell>Por quê?</TableCell></TableRow></TableHead><TableBody>{[
    ['Você tem dados em tabela e quer uma boa referência','Boa escolha','A combinação das árvores costuma oferecer previsões mais estáveis que uma única árvore.'],
    ['Uma Decision Tree muda muito quando o treino muda','Boa escolha','Várias árvores reduzem a dependência de uma única divisão.'],
    ['Você precisa explicar cada previsão com poucas regras','Prefira Decision Tree','É fácil seguir uma árvore pequena, mas difícil explicar dezenas de árvores individualmente.'],
    ['Você precisa de um modelo muito leve','Compare alternativas','Treinar e guardar dezenas ou centenas de árvores tem custo maior.'],
    ['Seu problema exige entender relações fora dos dados vistos','Cuidado','Como outros modelos, a floresta pode aprender padrões espúrios; teste com dados representativos.'],
   ].map(([caseName,decision,reason])=><TableRow key={caseName}><TableCell sx={{fontWeight:750}}>{caseName}</TableCell><TableCell><Chip size="small" label={decision} color={decision==='Boa escolha'?'success':decision==='Prefira Decision Tree'?'warning':decision==='Cuidado'?'error':'default'}/></TableCell><TableCell sx={{lineHeight:1.7}}>{reason}</TableCell></TableRow>)}</TableBody></Table>
   <Box sx={{borderLeft:'3px solid #9AB6D8',pl:2.5,mt:3}}><Typography fontWeight={850}>Decision Tree ou Random Forest?</Typography><Typography fontSize={14} lineHeight={1.8} mt={.5}>Se você precisa mostrar o caminho exato de uma decisão, comece com <strong>Decision Tree</strong>. Se precisa melhorar a estabilidade de previsões em dados tabulares, vale experimentar <strong>Random Forest</strong> e medir o resultado em dados separados para teste. Nenhuma delas é automaticamente superior em todas as situações.</Typography><Button component={RouterLink} to="/tecnica/arvore-de-decisao" size="small" sx={{mt:1}}>Rever Decision Tree</Button></Box>
  </Box>
  <CodeNotebook cells={randomForestPythonCells}/>
 </Stack>
}
