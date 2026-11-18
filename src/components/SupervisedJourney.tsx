import { useState } from 'react'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'

const stages = [
 {name:'1 · Conjunto completo',desc:'Primeiro reunimos o conjunto total de seis frutas. Cada uma tem características (cor e casca) e a resposta certa. Antes de ensinar qualquer coisa ao modelo, precisamos decidir quais exemplos serão usados para treinar e quais serão guardados para testar.',focus:'Ainda não existe uma separação. Temos um único conjunto de dados.'},
 {name:'2 · Separar treino e teste',desc:'Agora dividimos o conjunto: quatro frutas para treinar e duas para testar. Escondemos do modelo as respostas de teste. A árvore só pode aprender com as quatro primeiras.',focus:'Observe a transição: saímos de um conjunto único para treino e teste.'},
 {name:'3 · Aprender com o treino',desc:'A árvore procura uma pergunta que ajude a distinguir as classes no treino. Neste exemplo muito simples, a textura separa os quatro casos de treinamento.',focus:'Pergunta aprendida com o treino: casca rugosa?'},
 {name:'4 · Prever antes de conferir',desc:'Agora a árvore recebe apenas as pistas das frutas reservadas. Ela faz as previsões sem consultar a resposta verdadeira.',focus:'Primeiro prevemos. Só depois conferimos o gabarito.'},
 {name:'5 · Conferir e usar',desc:'Revelamos as respostas do teste e conferimos os acertos. Depois disso, podemos usar a árvore para fazer uma previsão sobre outra fruta.',focus:'O exemplo foi criado para ser fácil: dois acertos aqui não provam que a árvore funcionará no mundo real.'},
]
const fruits = [
 {name:'Maçã',hue:'Vermelha',rough:false},
 {name:'Laranja',hue:'Alaranjada',rough:true},
 {name:'Maçã',hue:'Vermelha',rough:false},
 {name:'Laranja',hue:'Alaranjada',rough:true},
 {name:'Maçã',hue:'Vermelha',rough:false},
 {name:'Laranja',hue:'Alaranjada',rough:true},
]
function Fruit({x,rough}:{x:number;rough:boolean}){
 const color=rough?'#E6A34B':'#D76E67'
 return <g>
  <circle cx={x} cy="112" r="24" fill={color}/>
  <path d={`M ${x} 89 L ${x+4} 77`} stroke="#55856C" strokeWidth="3" strokeLinecap="round"/>
  <ellipse cx={x+10} cy="83" rx="11" ry="5" fill="#6FA584" transform={`rotate(-22 ${x+10} 83)`}/>
  {rough&&[[-12,-5],[10,-8],[-7,10],[11,11],[0,0]].map(([dx,dy],i)=><circle key={i} cx={x+dx} cy={112+dy} r="1.7" fill="#FBE1B8"/>)}
 </g>
}
export default function SupervisedJourney(){
 const [step,setStep]=useState(0)
 return <Box sx={{my:3,bgcolor:'#F3F6FB',px:{xs:2,md:3},py:3}}>
  <Typography fontSize={12} fontWeight={850} color="primary.main" letterSpacing=".08em">APRENDA EM 5 ETAPAS · TREINO E TESTE</Typography>
  <Typography component="h3" fontSize={22} fontWeight={850} sx={{mt:1}}>{stages[step].name}</Typography>
  <Typography sx={{mt:1.3,mb:2,lineHeight:1.8,maxWidth:750}}>{stages[step].desc}</Typography>
  <Box sx={{overflowX:'auto',bgcolor:'white',p:1}}>
   <Box component="svg" viewBox="0 0 760 285" role="img" aria-label={`Passo ${step+1}: quatro exemplos de treino à esquerda e dois de teste à direita; a textura das laranjas é rugosa e a das maçãs é lisa em todas as etapas.`} sx={{width:'100%',minWidth:565,display:'block'}}>
    <title>Treino e teste: sempre as mesmas seis frutas, com informações reveladas gradualmente</title>
    {step===0&&<rect x="15" y="5" width="732" height="238" rx="8" fill="#F1F5FA" stroke="#CBD7E5"/>}
    <rect x="15" y="12" width="477" height="230" rx="8" fill={step===0?'transparent':step===2?'#E6F0FC':'#F2F6FB'} stroke={step===0?'transparent':'#B8CAE2'}/>
    <rect x="507" y="12" width="240" height="230" rx="8" fill={step===0?'transparent':'#FFF3E2'} stroke={step===0?'transparent':'#E8CDA1'}/>
    <text x="31" y="34" fill="#365D91" fontSize="13" fontWeight="800">{step===0?'CONJUNTO COMPLETO · 6 frutas':'TREINO · 4 exemplos'}</text>
    {step>0&&<text x="523" y="34" fill="#90652E" fontSize="13" fontWeight="800">TESTE · 2 exemplos</text>}
    {fruits.map((f,i)=>{
     const x=step===0?86+i*116:i<4?82+i*111:565+(i-4)*121
     const training=i<4
     const hidden=step>=1&&!training
     const showTruth=step===0||training||step===4
     const showGuess=hidden&&step>=3
     return <g key={i}>
      <rect x={x-46} y="51" width="92" height="170" rx="6" fill="#FFF" stroke={step===2&&training?'#7BA0D0':'#E0E6ED'} strokeWidth={step===2&&training?2:1}/>
      <Fruit x={x} rough={f.rough}/>
      <text x={x} y="151" fontSize="11.5" fill="#657489" textAnchor="middle">{f.hue}</text>
      <text x={x} y="168" fontSize="11.5" fill="#657489" textAnchor="middle">casca {f.rough?'rugosa':'lisa'}</text>
      <line x1={x-35} y1="180" x2={x+35} y2="180" stroke="#E3E8EF"/>
      {step===4&&!training?<><text x={x} y="196" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#285D9C">Prev.: {f.name}</text><text x={x} y="213" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#29754D">Real: {f.name} ✓</text></>:<text x={x} y="201" textAnchor="middle" fontSize="12" fontWeight="800" fill={showGuess?'#285D9C':'#253B55'}>{showTruth?f.name:showGuess?`Prev.: ${f.name}`:'Resposta: ?'}</text>}
     </g>
    })}
    {step===2&&<><rect x="185" y="248" width="390" height="28" rx="5" fill="#DDECFB"/><text x="380" y="267" textAnchor="middle" fill="#28538B" fontSize="13" fontWeight="800">Aprende a separar usando apenas o treino</text></>}
    {step===3&&<><rect x="183" y="248" width="395" height="28" rx="5" fill="#DDECFB"/><text x="380" y="267" textAnchor="middle" fill="#28538B" fontSize="13" fontWeight="800">A previsão aparece ANTES do gabarito</text></>}
    {step===4&&<><rect x="184" y="248" width="393" height="28" rx="5" fill="#E2F2EA"/><text x="380" y="267" textAnchor="middle" fill="#29694D" fontSize="13" fontWeight="800">2 de 2 neste exemplo inventado ≠ garantia real</text></>}
    {step<2&&<text x="380" y="267" textAnchor="middle" fill="#687A91" fontSize="12">Os desenhos e as características não mudam entre as etapas.</text>}
   </Box>
  </Box>
  <Stack direction={{xs:'column',sm:'row'}} alignItems={{sm:'center'}} gap={1} sx={{mt:2}}><Chip size="small" color="primary" label={`Etapa ${step+1}/5`}/><Typography sx={{fontSize:13,fontWeight:750,color:'text.secondary'}}>{stages[step].focus}</Typography></Stack>
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt:2}} gap={1}>
   <Stack direction="row" gap={.7}>{stages.map((_,i)=><Box component="button" key={i} onClick={()=>setStep(i)} aria-label={`Etapa ${i+1}`} sx={{p:0,width:step===i?27:11,height:8,border:0,borderRadius:5,bgcolor:step===i?'primary.main':'#C6D1E0',cursor:'pointer'}}/>)}</Stack>
   <Stack direction="row" gap={1}><Button size="small" disabled={step===0} startIcon={<ArrowBackRoundedIcon/>} onClick={()=>setStep(s=>s-1)}>Voltar</Button><Button size="small" variant="contained" endIcon={<ArrowForwardRoundedIcon/>} onClick={()=>setStep(s=>(s+1)%stages.length)}>{step===4?'Recomeçar':'Continuar'}</Button></Stack>
  </Stack>
 </Box>
}
