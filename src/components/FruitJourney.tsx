import { useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import type { EasyLesson } from '../core/studyGuide.ts'

const ink = '#263956', accent = '#355CA6', light = '#EDF3FB', apple = '#D66B63', orange = '#E5A454'
const samples = [
  {x:110,name:'Maçã',color:apple,rough:false,shade:'avermelhada'},
  {x:259,name:'Laranja',color:orange,rough:true,shade:'alaranjada'},
  {x:408,name:'Maçã',color:apple,rough:false,shade:'avermelhada'},
  {x:557,name:'Laranja',color:orange,rough:true,shade:'alaranjada'},
]
function FruitIcon({cx,cy,tint,rough=false}:{cx:number;cy:number;tint:string;rough?:boolean}){
 return <g>
  <ellipse cx={cx} cy={cy+13} rx="25" ry="24" fill={tint}/>
  <path d={`M ${cx} ${cy-10} q -6 -15 -14 -10 q 0 -13 15 -12 q 12 0 14 14`} stroke="#477862" strokeWidth="3" fill="none" strokeLinecap="round"/>
  <path d={`M ${cx} ${cy-15} q 8 -15 23 -9 q -6 13 -23 9`} fill="#7EAA8A"/>
  {rough && <g fill="#F7D2A3" opacity=".85">{[[-12,7],[7,5],[-4,18],[13,22],[-13,25],[4,30]].map(([dx,dy],i)=><circle key={i} cx={cx+dx} cy={cy+dy} r="2.2"/>)}</g>}
  <ellipse cx={cx-10} cy={cy+4} rx="6" ry="3" fill="#FFFFFF" opacity=".22" transform={`rotate(-35 ${cx-10} ${cy+4})`}/>
 </g>
}
function Badge({x,y,text,fill='#E9EFF9',color=ink}:{x:number;y:number;text:string;fill?:string;color?:string}) {
 return <g><rect x={x-55} y={y-16} width="110" height="32" rx="6" fill={fill}/><text x={x} y={y+5} textAnchor="middle" fill={color} fontSize="13" fontWeight="600">{text}</text></g>
}
function SampleDrawing({showLabels}:{showLabels:boolean}){
 return <>
  <text x="32" y="35" fontSize="13" fontWeight="700" fill={ink}>QUATRO EXEMPLOS DA MESMA FEIRA</text>
  <text x="32" y="57" fontSize="12" fill="#768397">Cor e textura são pistas; não mudam quando a etiqueta aparece.</text>
  {samples.map((f,i)=><g key={i}>
   <rect x={f.x-57} y="79" width="114" height="158" rx="9" fill="#FFFFFF" stroke="#E3E9F1"/>
   <FruitIcon cx={f.x} cy={122} tint={f.color} rough={f.rough}/>
   <text x={f.x} y="175" textAnchor="middle" fontSize="12" fill="#758096">{f.shade}</text>
   <text x={f.x} y="194" textAnchor="middle" fontSize="12" fill="#758096">{f.rough?'casca rugosa':'casca lisa'}</text>
   <text x={f.x} y="222" textAnchor="middle" fontWeight="700" fontSize="13" fill={showLabels?ink:accent}>{showLabels?f.name:'etiqueta: ?'}</text>
  </g>)}
  <text x="32" y="263" fontSize="12" fill="#768397">* Exemplos simplificados: frutas reais podem ter outras cores e texturas.</text>
 </>
}
function FlowDrawing({kind}:{kind:EasyLesson['illustration']}){
 if(kind==='tree')return <>
  <text x="32" y="35" fontSize="13" fontWeight="700" fill={ink}>UMA ÁRVORE DE PERGUNTAS</text>
  <path d="M360 114 L207 166 M360 114 L518 166" fill="none" stroke="#91A5C3" strokeWidth="2.5"/>
  <rect x="253" y="61" width="214" height="53" rx="7" fill={light}/><text x="360" y="94" fontWeight="700" fontSize="16" textAnchor="middle" fill={ink}>Casca rugosa?</text>
  <rect x="244" y="129" width="61" height="25" rx="4" fill="#FFF" stroke="#D8E3F0"/><text x="274" y="146" textAnchor="middle" fontSize="13" fontWeight="700" fill={accent}>Sim</text>
  <rect x="422" y="129" width="61" height="25" rx="4" fill="#FFF" stroke="#D8E3F0"/><text x="452" y="146" textAnchor="middle" fontSize="13" fontWeight="700" fill={accent}>Não</text>
  <rect x="108" y="166" width="198" height="67" rx="8" fill="#FEF3E4"/><rect x="417" y="166" width="198" height="67" rx="8" fill="#FBEDEB"/>
  <text x="207" y="190" textAnchor="middle" fill={ink} fontSize="12">Previsão (exemplo)</text><text x="207" y="216" textAnchor="middle" fill={ink} fontWeight="800" fontSize="18">Laranja</text>
  <text x="516" y="190" textAnchor="middle" fill={ink} fontSize="12">Previsão (exemplo)</text><text x="516" y="216" textAnchor="middle" fill={ink} fontWeight="800" fontSize="18">Maçã</text>
  <text x="32" y="266" fontSize="12" fill="#768397">A pergunta foi simplificada para ilustrar. A árvore real aprende divisões pelos dados.</text>
 </>
 if(kind==='neural')return <>
  <text x="32" y="35" fontSize="13" fontWeight="700" fill={ink}>AS PISTAS PASSAM POR CAMADAS</text>
  {[115,203].map((y,i)=><g key={y}><rect x="32" y={y-23} rx="7" width="148" height="46" fill={light}/><text x="106" y={y+5} textAnchor="middle" fontWeight="700" fill={ink} fontSize="14">{i===0?'Cor':'Textura'}</text></g>)}
  {[105,159,213].map((y,i)=><g key={i}>
   {[115,203].map((yy,j)=><line key={j} x1="180" y1={yy} x2="317" y2={y} stroke={i===1?accent:'#A8B9D1'} strokeWidth={i===1?2.7:1.8}/>)}
   <circle cx="333" cy={y} r="20" fill="#D8E6F8" stroke="#8EA6CC" strokeWidth="2"/>
  </g>)}
  {[105,159,213].map(y=><line key={y} x1="352" y1={y} x2="486" y2="159" stroke="#A8B9D1" strokeWidth="2"/>)}
  <rect x="486" y="128" width="184" height="62" rx="9" fill="#EAF5F0"/><text x="578" y="151" textAnchor="middle" fill={ink} fontSize="12">Previsão</text><text x="578" y="175" textAnchor="middle" fill={ink} fontWeight="800" fontSize="17">Maçã ou laranja?</text>
  <text x="30" y="264" fontSize="12" fill="#768397">Cada linha representa uma conexão com peso ajustável durante o treino.</text>
 </>
 if(kind==='clusters'||kind==='unsupervised')return <ScatterDrawing />
 if(kind==='overview')return <>
  <text x="32" y="35" fontSize="13" fontWeight="700" fill={ink}>O QUE PODEMOS FAZER COM OS EXEMPLOS?</text>
  <rect x="255" y="64" width="212" height="58" rx="8" fill={light}/><text x="361" y="99" textAnchor="middle" fontWeight="750" fontSize="17" fill={ink}>Dados das frutas</text>
  <path d="M 316 122 L 200 163 M 406 122 L 526 163" stroke="#9FB0C9" strokeWidth="2.6" fill="none"/>
  <rect x="54" y="168" width="272" height="75" rx="8" fill="#E8F0FB"/><rect x="393" y="168" width="272" height="75" rx="8" fill="#F7EDE6"/>
  <text x="190" y="191" textAnchor="middle" fontWeight="800" fontSize="15" fill={ink}>Com respostas</text><text x="190" y="214" textAnchor="middle" fontSize="13" fill={ink}>Prever maçã ou laranja</text>
  <text x="529" y="191" textAnchor="middle" fontWeight="800" fontSize="15" fill={ink}>Sem respostas</text><text x="529" y="214" textAnchor="middle" fontSize="13" fill={ink}>Encontrar grupos parecidos</text>
 </>
 return <>
  <text x="32" y="35" fontSize="13" fontWeight="700" fill={ink}>UMA FRUTA NOVA</text>
  <FruitIcon cx={165} cy={132} tint={orange} rough/>
  <Badge x={165} y={205} text="Sem etiqueta"/>
  <path d="M 275 159 L 440 159" stroke="#91A5C3" strokeWidth="2.5"/><path d="M 428 150 L 443 159 L 428 168" fill="none" stroke="#91A5C3" strokeWidth="2.5"/>
  <rect x="462" y="98" width="205" height="110" rx="9" fill="#E9F5ED"/><text x="564" y="128" textAnchor="middle" fill={ink} fontSize="13">Palpite do modelo</text><text x="564" y="169" textAnchor="middle" fill={ink} fontWeight="800" fontSize="23">Laranja</text>
  <text x="32" y="263" fontSize="12" fill="#768397">É uma previsão baseada no padrão aprendido, não uma certeza.</text>
 </>
}
function ScatterDrawing(){
 const points = [[105,165],[145,194],[178,153],[129,126],[192,205],[180,117],[435,100],[476,144],[515,112],[560,173],[499,188],[557,120]]
 return <>
  <text x="32" y="35" fontSize="13" fontWeight="700" fill={ink}>UM GRÁFICO COM AS CARACTERÍSTICAS DAS FRUTAS</text>
  <line x1="62" y1="230" x2="657" y2="230" stroke="#9DAABF" strokeWidth="2"/><line x1="62" y1="230" x2="62" y2="62" stroke="#9DAABF" strokeWidth="2"/>
  <text x="318" y="263" fill="#768397" fontSize="12">cor: avermelhada → alaranjada</text><text x="15" y="60" fill="#768397" fontSize="11">textura</text>
  <ellipse cx="159" cy="163" rx="103" ry="80" fill="#E3EEF9" opacity=".85"/><ellipse cx="497" cy="147" rx="120" ry="90" fill="#FFF0E0" opacity=".85"/>
  {points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="11" fill={i<6?accent:orange} stroke="#FFF" strokeWidth="3"/>)}
  <text x="155" y="80" textAnchor="middle" fill={accent} fontSize="12" fontWeight="800">GRUPO 1</text><text x="500" y="58" textAnchor="middle" fill="#B3782D" fontSize="12" fontWeight="800">GRUPO 2</text>
 </>
}

export default function FruitJourney({lesson}:{lesson:EasyLesson}){
 const [step,setStep]=useState(0)
 const showLabels=lesson.illustration !== 'unsupervised' && lesson.illustration !== 'clusters'
 return <Box sx={{my:3,backgroundColor:'#F3F6FA',borderRadius:1.5,p:{xs:2,md:3},minWidth:0}}>
  <Stack direction={{xs:'column',sm:'row'}} alignItems={{xs:'start',sm:'center'}} justifyContent="space-between" gap={1} sx={{mb:2}}>
   <Box><Typography sx={{fontWeight:850,fontSize:12,letterSpacing:'.08em',color:'primary.main'}}>EXPERIMENTE · A BANCA DE FRUTAS</Typography><Typography sx={{fontWeight:750,fontSize:20,mt:.5}}>{lesson.steps[step].title}</Typography></Box>
   <Typography sx={{fontSize:13,color:'text.secondary',fontVariantNumeric:'tabular-nums'}}>Etapa {step+1} de {lesson.steps.length}</Typography>
  </Stack>
  <Typography sx={{lineHeight:1.75,maxWidth:760,mb:2,color:'text.secondary',minHeight:{md:52}}}>{lesson.steps[step].description}</Typography><Typography sx={{fontSize:12.5,fontWeight:700,color:'primary.dark',mb:1.5}}>O que observar agora: {step===0?'as pistas que permanecem iguais':step===1?(showLabels?'as etiquetas reveladas — as frutas não mudaram':'os dados continuam sem etiquetas'):lesson.illustration==='tree'?'os dois caminhos saindo da pergunta':lesson.illustration==='neural'?'as conexões que combinam as pistas':lesson.illustration==='overview'?'a diferença entre receber respostas e descobrir grupos':lesson.illustration==='clusters'||lesson.illustration==='unsupervised'?'a organização dos pontos sem conhecer suas etiquetas':'a previsão feita pelo modelo'}</Typography>
  <Box sx={{backgroundColor:'#FFFFFF',overflowX:'auto',borderRadius:1.2}}>
   <Box component="svg" viewBox="0 0 722 286" role="img" aria-label={step<2?'Quatro frutas ilustradas, com suas características e '+(step===1&&showLabels?'as etiquetas':'sem as etiquetas'): 'Diagrama ilustrativo: '+lesson.steps[step].title} sx={{width:'100%',display:'block',minWidth:440}}>
    <title>{lesson.steps[step].title}: exemplo de aprendizado de máquina com frutas</title>
    {step < 2 ? <SampleDrawing showLabels={step===1&&showLabels}/> : <FlowDrawing kind={lesson.illustration}/>}
   </Box>
  </Box>
  <Stack direction="row" sx={{mt:2}} alignItems="center" justifyContent="space-between" gap={1}>
   <Stack direction="row" gap={.6} aria-label="Escolha uma etapa">{lesson.steps.map((s,i)=><Box key={s.title} component="button" onClick={()=>setStep(i)} aria-label={`Ir para a etapa ${i+1}`} aria-current={step===i?'step':undefined} sx={{cursor:'pointer',height:7,width:step===i?29:11,transition:'width 140ms',borderRadius:5,border:0,bgcolor:step===i?'primary.main':'#C2CBD8',p:0}}/>)}</Stack>
   <Stack direction="row" gap={1}>
    {step>0&&<Button size="small" onClick={()=>setStep(step-1)} startIcon={<ArrowBackRoundedIcon/>}>Voltar</Button>}
    {step<lesson.steps.length-1?<Button variant="contained" size="small" onClick={()=>setStep(step+1)} endIcon={<ArrowForwardRoundedIcon/>}>Próxima etapa</Button>:<Button variant="text" size="small" onClick={()=>setStep(0)} startIcon={<RestartAltRoundedIcon/>}>Rever</Button>}
   </Stack>
  </Stack>
 </Box>
}
