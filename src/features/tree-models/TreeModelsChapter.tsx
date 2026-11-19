import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Breadcrumbs, Button, Chip, Link, Stack, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import { TreeFamilyGuide } from '../../components/TreeFamilyGuide.tsx'
import { nodeNamed } from '../../core/studyGuide.ts'
import { trainingFruits } from '../decision-tree/fruitExamples.ts'

type Fruit = { name: string; color: string; skin: string; answer: 'Maçã' | 'Laranja' }
const examples: Fruit[] = [
 {name:'Maçã vermelha, casca lisa',color:'vermelha',skin:'lisa',answer:'Maçã'},
 {name:'Maçã vermelha, casca rugosa',color:'vermelha',skin:'rugosa',answer:'Maçã'},
 {name:'Laranja alaranjada, casca rugosa',color:'alaranjada',skin:'rugosa',answer:'Laranja'},
 {name:'Laranja amarelada, casca rugosa',color:'amarelada',skin:'rugosa',answer:'Laranja'},
]
const lesson = [
 { title:'Primeiro, olhe os exemplos', body:'Temos frutas identificadas como maçãs ou laranjas. Além do nome correto, conhecemos a cor e a textura da casca. É com essas pistas que uma árvore aprende a fazer perguntas.', watch:'Ainda não temos uma árvore: apenas exemplos dos quais ela poderá aprender.' },
 { title:'A árvore começa pela raiz', body:'A primeira pergunta separa as frutas em dois grupos. Neste exemplo, começamos por “A casca é lisa?”. Quem responde SIM vai para um lado; quem responde NÃO vai para outro.', watch:'A caixa de cima é a raiz. As linhas que saem dela são os ramos.' },
 { title:'Um grupo ainda está misturado', body:'Todas as frutas com casca lisa no conjunto de treino são maçãs. Mas o grupo de casca rugosa ainda tem maçãs e laranjas: uma pergunta só não resolve esse grupo.', watch:'O lado SIM já pode terminar em uma folha. O lado NÃO precisa de um novo nó de decisão.' },
 { title:'Uma nova pergunta resolve o grupo restante', body:'No ramo rugoso, a árvore pergunta “A cor é vermelha?”. As frutas vermelhas desse grupo são maçãs, enquanto as demais são laranjas. Cada caminho termina em uma folha.', watch:'Uma árvore cresce apenas onde ainda precisa separar exemplos; nem todos os ramos precisam ter a mesma altura.' },
 { title:'Agora percorra a árvore com uma fruta', body:'Escolha uma fruta abaixo. A árvore não precisa aprender de novo para cada previsão: ela consulta as características da fruta e segue as respostas até chegar a uma folha.', watch:'O caminho destacado mostra a sequência de perguntas. O nome na folha é a previsão do exemplo.' },
] as const

function Diagram({stage, fruit}:{stage:number;fruit:Fruit}){
 const smooth=fruit.skin==='lisa'
 const red=fruit.color==='vermelha'
 const active = stage===4
 const path1=active ? (smooth?'left':'right') : undefined
 const path2=active&&!smooth ? (red?'left':'right') : undefined
 const line=(d:string,on=false)=><path d={d} fill="none" stroke={on?'#2563EB':'#A7B5CA'} strokeWidth={on?4:2.4} strokeLinecap="round" />
 const node=(x:number,y:number,w:number,h:number,text:string,kind:'question'|'apple'|'orange'|'mixed',highlight=false)=>{
  const palette=kind==='question'?['#EAF1FB','#AAC0E3','#263D5D']:kind==='apple'?['#F9E5E8','#ECC4CB','#8B3F4A']:kind==='orange'?['#FFF0DD','#EFD3A8','#8C571E']:['#F1F4F9','#C8D3E0','#43546C']
  return <g><rect x={x} y={y} width={w} height={h} rx="11" fill={palette[0]} stroke={highlight?'#2563EB':palette[1]} strokeWidth={highlight?3:1.7}/><text x={x+w/2} y={y+h/2+5} fontSize="16" fontWeight="700" textAnchor="middle" fill={palette[2]}>{text}</text></g>
 }
 const branch=(x:number,y:number,label:string,selected=false)=><g><rect x={x-24} y={y-13} width="48" height="26" rx="8" fill="#FFFFFF" stroke={selected?'#2563EB':'#DCE4EF'}/><text x={x} y={y+5} fontSize="12" textAnchor="middle" fontWeight="800" fill={selected?'#1D4ED8':'#556780'}>{label}</text></g>
 return <Box sx={{width:'100%',overflowX:'auto',borderRadius:2,bgcolor:'#F8FAFD',border:'1px solid #E3EAF3',p:{xs:1,sm:2}}}>
  <svg role="img" aria-label="Árvore didática: raiz Casca lisa, um ramo Maçã e outro que pergunta Cor vermelha para decidir entre Maçã e Laranja" viewBox="0 0 780 440" style={{display:'block',width:'100%',minWidth:480,height:'auto'}}>
   {stage>=1&&<>
    {stage>=2&&line('M390 102 L390 135 L195 175',path1==='left')}
    {stage>=2&&line('M390 102 L390 135 L590 175',path1==='right')}
    {stage>=3&&line('M590 229 L590 259 L480 305',path2==='left')}
    {stage>=3&&line('M590 229 L590 259 L695 305',path2==='right')}
    {node(280,42,220,60,'Casca lisa?','question',active)}
    {stage>=2&&<>
     {branch(282,145,'SIM',path1==='left')}{branch(502,145,'NÃO',path1==='right')}
     {node(95,175,200,55,'Maçã','apple',path1==='left')}
     {node(480,175,220,55,stage>=3?'Cor vermelha?':'Maçã ou laranja?','question',path1==='right')}
    </>}
    {stage>=3&&<>
     {branch(515,271,'SIM',path2==='left')}{branch(662,271,'NÃO',path2==='right')}
     {node(380,305,200,55,'Maçã','apple',path2==='left')}
     {node(600,305,175,55,'Laranja','orange',path2==='right')}
    </>}
   </>}
   {stage===0&&<>
     <rect x="150" y="110" width="480" height="190" rx="18" fill="#FFFFFF" stroke="#CBD5E1" strokeDasharray="7 6" strokeWidth="2"/>
     <text x="390" y="167" textAnchor="middle" fontSize="21" fill="#40516A" fontWeight="800">Ainda não há perguntas</text>
     <text x="390" y="203" textAnchor="middle" fontSize="16" fill="#5C6E85">O aprendizado começa com exemplos.</text>
     <text x="390" y="239" textAnchor="middle" fontSize="16" fill="#5C6E85">Avance para construir a árvore.</text>
   </>}
   {stage===1&&<text x="390" y="153" textAnchor="middle" fontSize="15" fill="#687B91">Primeiro nó: a raiz</text>}
   {stage===2&&<text x="590" y="277" textAnchor="middle" fontSize="14" fill="#6B7891">Esse grupo ainda está misturado.</text>}
   {stage===4&&<text x="390" y="405" textAnchor="middle" fontSize="15" fill="#1D4ED8" fontWeight="700">Caminho azul = decisões para a fruta escolhida</text>}
  </svg>
 </Box>
}

const typography={fontSize:16,lineHeight:1.85,maxWidth:790}
export default function TreeModelsChapter(){
 const [step,setStep]=useState(0)
 const [fruitIndex,setFruitIndex]=useState(0)
 const fruit=examples[fruitIndex]
 const supervised=nodeNamed('Aprendizado supervisionado')
 return <Box sx={{maxWidth:960,mx:'auto',pb:9}}>
  <Breadcrumbs sx={{mb:{xs:3,md:5},fontSize:13}}><Link component={RouterLink} to="/" underline="hover">Início</Link>{supervised&&<Link component={RouterLink} to={`/conceito/${supervised.id}`} underline="hover">Aprendizado supervisionado</Link>}<Typography variant="body2" color="text.primary">Modelos baseados em árvores</Typography></Breadcrumbs>
  <Typography color="primary.main" fontWeight={850} fontSize={12} letterSpacing=".1em" sx={{mb:1.5}}>CONCEITO FUNDAMENTAL · ATLAS</Typography>
  <Typography component="h1" sx={{fontSize:{xs:37,md:56},fontWeight:900,letterSpacing:'-.05em',lineHeight:1.12,maxWidth:820,mb:2}}>Como funciona uma árvore?</Typography>
  <Typography sx={{fontSize:{xs:18,md:21},lineHeight:1.65,color:'text.secondary',maxWidth:780,mb:4}}>Uma árvore é uma maneira de organizar decisões. Em vez de tentar responder tudo de uma vez, ela faz uma pergunta de cada vez e segue o caminho indicado pela resposta.</Typography>
  <Typography sx={{fontSize:17,lineHeight:1.9,maxWidth:790,mb:2}}>Imagine que alguém quer identificar uma fruta. Você pode começar perguntando: <strong>“A casca é lisa?”</strong> Dependendo da resposta, você faz outra pergunta — ou já tem informação suficiente para dizer se é maçã ou laranja.</Typography>
  <Box sx={{borderLeft:'3px solid',borderColor:'primary.main',pl:2.5,py:1,mb:6}}><Typography color="primary.main" fontWeight={850} fontSize={12} letterSpacing=".07em">EM OUTRAS PALAVRAS</Typography><Typography fontSize={18} fontWeight={800} sx={{mt:1}}>Uma árvore transforma uma decisão complicada em várias decisões pequenas.</Typography></Box>

  <Box component="section" id="anatomia" sx={{borderTop:'1px solid',borderColor:'divider',pt:5,mb:6}}>
   <Typography color="primary.main" fontWeight={850} fontSize={12} letterSpacing=".08em" sx={{mb:1.5}}>AS PEÇAS DA ÁRVORE</Typography>
   <Typography component="h2" sx={{fontSize:{xs:26,md:34},fontWeight:850,letterSpacing:'-.04em',mb:2}}>Raiz, nó, ramo e folha: o que significa cada um?</Typography>
   <Typography sx={{...typography,mb:3}}>Pense na árvore como um pequeno mapa de decisões. Cada parte tem um papel. A figura abaixo usa <strong>a mesma árvore</strong> que vamos construir na aula, para você reconhecer as partes sem trocar de exemplo.</Typography>
   <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'minmax(0,1.3fr) minmax(240px,.7fr)'},gap:3,alignItems:'start'}}>
    <Diagram stage={3} fruit={fruit}/>
    <Stack gap={2}>
     {[
      ['Raiz','É o primeiro nó, no topo da árvore. Aqui, a pergunta inicial é “Casca lisa?”.'],
      ['Nó de decisão','É uma caixa que faz uma pergunta. Uma árvore pode ter vários nós internos.'],
      ['Ramo','É uma linha que conecta duas caixas. O ramo indica qual caminho seguir para SIM ou NÃO.'],
      ['Folha','É o fim de um caminho. Neste exemplo de classificação, a folha apresenta a classe prevista: maçã ou laranja.'],
     ].map(([name,desc])=><Box key={name} sx={{borderBottom:'1px solid #E3E8F0',pb:1.5}}><Typography fontWeight={850} sx={{mb:.4}}>{name}</Typography><Typography color="text.secondary" fontSize={14} lineHeight={1.65}>{desc}</Typography></Box>)}
    </Stack>
   </Box>
   <Typography sx={{fontSize:14,color:'text.secondary',mt:2}}>Uma folha também pode conter um valor numérico, por exemplo numa árvore usada para regressão. Aqui estamos mostrando um caso simples de classificação.</Typography>
  </Box>

  <Box component="section" id="aprenda" sx={{borderTop:'1px solid',borderColor:'divider',pt:5,mb:6}}>
   <Typography color="primary.main" fontWeight={850} fontSize={12} letterSpacing=".08em" sx={{mb:1.5}}>APRENDA PASSO A PASSO</Typography>
   <Typography component="h2" sx={{fontSize:{xs:26,md:34},fontWeight:850,letterSpacing:'-.04em',mb:2}}>Vamos construir e percorrer uma árvore</Typography>
   <Typography sx={{...typography,mb:3}}>Observe como o desenho muda a cada etapa. Primeiro temos exemplos. Depois, aparecem as perguntas, os ramos e, por último, o caminho de uma fruta que queremos identificar.</Typography>
   <Box sx={{border:'1px solid',borderColor:'divider',borderRadius:2,p:{xs:2,sm:3},mb:3}}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb:1}}><Typography fontWeight={800} fontSize={13} color="primary.main">ETAPA {step+1} DE {lesson.length}</Typography><Typography fontSize={13} color="text.secondary">Construção de uma árvore</Typography></Stack>
    <Box sx={{width:'100%',height:6,bgcolor:'#E7EDF5',borderRadius:4,mb:3,overflow:'hidden'}}><Box sx={{width:`${((step+1)/lesson.length)*100}%`,height:'100%',bgcolor:'primary.main',transition:'width .2s'}}/></Box>
    <Typography component="h3" fontSize={{xs:21,sm:25}} fontWeight={850} sx={{mb:1}}>{lesson[step].title}</Typography>
    <Typography sx={{fontSize:16,lineHeight:1.8,mb:3,maxWidth:790}}>{lesson[step].body}</Typography>
    {step===0&&<Box sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',sm:'repeat(4,minmax(0,1fr))'},gap:1.3,mb:2}}>{trainingFruits.slice(0,8).map(f=><Box key={f.id} sx={{border:'1px solid #DDE5F0',bgcolor:'#F8FAFD',p:1.5,borderRadius:1.5}}><Typography fontSize={13} fontWeight={800}>{f.label}</Typography><Typography fontSize={12} color="text.secondary">{f.color} · {f.skin}</Typography></Box>)}</Box>}
    <Diagram stage={step} fruit={fruit}/>
    {step===4&&<Box sx={{mt:2}}><Typography fontSize={14} fontWeight={800} sx={{mb:1}}>Escolha uma fruta para percorrer os ramos</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{examples.map((f,i)=><Button key={f.name} onClick={()=>setFruitIndex(i)} variant={i===fruitIndex?'contained':'outlined'} size="small" sx={{textTransform:'none',borderRadius:1.5,whiteSpace:'normal',textAlign:'left'}}>{f.name}</Button>)}</Stack><Typography sx={{mt:2,fontWeight:750,fontSize:15}}>Previsão ao chegar à folha: {fruit.answer}.</Typography></Box>}
    <Box sx={{borderLeft:'3px solid #5F88C6',bgcolor:'#F4F7FC',p:2,mt:3,mb:3}}><Typography fontSize={12} fontWeight={850} color="primary.main" letterSpacing=".05em">O QUE OBSERVAR</Typography><Typography fontSize={14} lineHeight={1.7} sx={{mt:.5}}>{lesson[step].watch}</Typography></Box>
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap"><Button startIcon={<ArrowBackRoundedIcon/>} disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))} sx={{textTransform:'none'}}>Anterior</Button><Stack direction="row" gap={1}><Button startIcon={<RestartAltRoundedIcon/>} onClick={()=>{setStep(0);setFruitIndex(0)}} sx={{textTransform:'none'}}>Recomeçar</Button><Button variant="contained" endIcon={<ArrowForwardRoundedIcon/>} disabled={step===lesson.length-1} onClick={()=>setStep(s=>Math.min(lesson.length-1,s+1))} sx={{textTransform:'none'}}>Próximo</Button></Stack></Stack>
   </Box>
  </Box>

  <Box component="section" id="treinamento" sx={{borderTop:'1px solid',borderColor:'divider',pt:5,mb:6}}>
   <Typography color="primary.main" fontWeight={850} fontSize={12} letterSpacing=".08em" sx={{mb:1.5}}>COMO ELA APRENDE</Typography>
   <Typography component="h2" sx={{fontSize:{xs:26,md:34},fontWeight:850,letterSpacing:'-.04em',mb:2}}>Quem decide quais perguntas vão aparecer?</Typography>
   <Typography sx={{...typography,mb:2}}>Durante o treinamento, o algoritmo examina os exemplos cujas respostas já conhece. Ele testa perguntas possíveis e procura aquelas que <strong>separam melhor os exemplos</strong>. Depois, repete o processo nos grupos que ainda estão misturados.</Typography>
   <Typography sx={{...typography,mb:2}}>Se um ramo reúne apenas maçãs, por exemplo, pode terminar numa folha. Se ainda mistura maçãs e laranjas, talvez seja útil fazer outra pergunta. É assim que a estrutura cresce.</Typography>
   <Box sx={{bgcolor:'#F5F8FC',border:'1px solid #DBE5F0',borderRadius:2,p:2.5}}><Typography fontWeight={850} sx={{mb:1}}>Uma distinção importante</Typography><Typography sx={{fontSize:15,lineHeight:1.75}}>O desenho usa perguntas simples escolhidas para ensinar a ideia. No treinamento real, a escolha é feita por um critério calculado a partir dos dados, como redução de impureza. Uma árvore pode aprender outras perguntas se os exemplos mudarem. Você verá esse cálculo com detalhes na aula de Decision Tree.</Typography></Box>
  </Box>

  <Box component="section" id="familia" sx={{borderTop:'1px solid',borderColor:'divider',pt:5}}>
   <Typography color="primary.main" fontWeight={850} fontSize={12} letterSpacing=".08em" sx={{mb:1.5}}>PARA IR ALÉM</Typography>
   <Typography component="h2" sx={{fontSize:{xs:26,md:34},fontWeight:850,letterSpacing:'-.04em',mb:2}}>Quais modelos utilizam árvores?</Typography>
   <Typography sx={{...typography,mb:2}}>Agora que você conhece as partes de uma árvore, faz sentido estudar os modelos que usam essa estrutura. Alguns trabalham com uma árvore só; outros combinam muitas. A tabela é um guia de escolha, não uma nova aula obrigatória.</Typography>
   <TreeFamilyGuide/>
   <Stack direction="row" gap={1} flexWrap="wrap" sx={{mt:2}}><Chip component={RouterLink} to="/tecnica/arvore-de-decisao" clickable label="Começar por Decision Tree" variant="outlined" sx={{borderRadius:1,fontWeight:750}}/><Chip component={RouterLink} to="/tecnica/random-forest" clickable label="Depois: Random Forest" variant="outlined" sx={{borderRadius:1,fontWeight:750}}/><Chip component={RouterLink} to="/tecnica/gradient-boosting" clickable label="Depois: Gradient Boosting" variant="outlined" sx={{borderRadius:1,fontWeight:750}}/></Stack>
  </Box>
 </Box>
}
