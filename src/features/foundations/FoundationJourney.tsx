import { useState } from 'react'
import { Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import { fruitExamples } from '../decision-tree/fruitExamples.ts'

type Mode = 'ml' | 'supervised' | 'unsupervised'
type Stage = { name: string; description: string; observe: string }
const lessons: Record<Mode,{intro:string;stages:Stage[]}> = {
 ml: {intro:'Acompanhe a mesma banca de frutas que usaremos nas aulas de Decision Tree e Random Forest. O que muda a cada etapa é a informação que entregamos ao algoritmo.',stages:[
  {name:'Primeiro, reunimos os exemplos',description:'Temos dez frutas. Cada uma pode ser descrita por características: cor e textura da casca. Aqui ainda não treinamos nenhum modelo.',observe:'São as características, e não o desenho da fruta, que um algoritmo recebe.'},
  {name:'Transformamos observações em dados',description:'Agora organizamos as informações em uma tabela. Cada linha representa uma fruta; cada coluna, uma característica. Algumas tarefas também incluem a resposta correta.',observe:'Cor e casca são entradas. O nome é uma possível resposta que queremos prever.'},
  {name:'O algoritmo procura um padrão',description:'Damos exemplos para um algoritmo. Uma Decision Tree pode aprender perguntas sobre cor e textura; outro algoritmo pode aprender de outra maneira. Não estamos escrevendo manualmente uma regra para cada fruta.',observe:'Um mesmo conjunto pode dar origem a modelos diferentes.'},
  {name:'Testamos o que foi aprendido',description:'Reservamos frutas que o modelo não usou para aprender. Apresentamos só suas características e conferimos depois se a previsão está correta.',observe:'Acertar os exemplos de treino não é o mesmo que acertar novos exemplos.'},
 ]},
 supervised: {intro:'No aprendizado supervisionado, cada fruta de treino vem com uma resposta conhecida. Vamos separar os dados, aprender com uma parte e avaliar na outra.',stages:[
  {name:'Começamos com todos os dados',description:'Este é nosso conjunto completo de dez frutas, com as características e as respostas. Ainda não dividimos nada.',observe:'As respostas existem no conjunto original, mas não podem ser usadas todas para treinar e avaliar ao mesmo tempo.'},
  {name:'Separamos treino e teste',description:'Oito frutas vão para treino e duas ficam reservadas para teste. O algoritmo verá os nomes apenas das oito usadas no treinamento.',observe:'No teste, ocultamos a resposta do algoritmo. Só a revelamos ao avaliar.'},
  {name:'Treinamos usando as respostas',description:'A Decision Tree, por exemplo, compara perguntas como “casca lisa?” e escolhe divisões que separam melhor maçãs e laranjas no treino. Outros modelos aprendem de outras formas.',observe:'O algoritmo usa características e respostas apenas do conjunto de treino para ajustar o modelo.'},
  {name:'Prevemos sem consultar o gabarito',description:'O modelo recebe as características das duas frutas reservadas. Ele faz uma previsão sem ler seus nomes verdadeiros.',observe:'Previsões e respostas corretas são coisas diferentes.'},
  {name:'Conferimos e discutimos o resultado',description:'Agora revelamos as respostas do teste e comparamos com as previsões. Dois acertos em duas frutas são insuficientes para garantir desempenho no mundo real.',observe:'Avaliar exige dados que não foram usados para ajustar o modelo.'},
 ]},
 unsupervised: {intro:'Usaremos as mesmas frutas, mas agora sem entregar seus nomes ao algoritmo. Ele pode tentar descobrir semelhanças — não adivinhar automaticamente o que é “maçã” ou “laranja”.',stages:[
  {name:'Reunimos as frutas',description:'O conjunto tem as mesmas cores e texturas do aprendizado supervisionado. Desta vez, não entregamos a coluna com o nome de cada fruta.',observe:'O algoritmo conhece as características, mas não recebe a resposta correta.'},
  {name:'Escolhemos o que significa ser parecido',description:'Podemos representar cor e textura por números. Um algoritmo como K-means compara distâncias; a forma de representar as características afeta o resultado.',observe:'A maneira de medir semelhança é uma decisão importante, não uma verdade natural dos dados.'},
  {name:'Formamos grupos provisórios',description:'Nesta ilustração, agrupamos frutas de casca lisa e rugosa para demonstrar a ideia. Um algoritmo real poderia produzir outro agrupamento, dependendo dos dados e parâmetros.',observe:'Os grupos indicam semelhança segundo um critério. Não são automaticamente os nomes das frutas.'},
  {name:'Interpretamos o que apareceu',description:'Só depois de encontrar os grupos olhamos para seus exemplos e tentamos entender o que eles representam. Podemos achar grupos úteis ou descobrir que as características escolhidas não bastam.',observe:'Encontrar grupos é diferente de prever uma etiqueta conhecida.'},
 ]},
}
const fruitColor: Record<string,string> = {Vermelha:'#D85B5D',Esverdeada:'#83B77D',Alaranjada:'#E8A24B',Amarelada:'#E7C65B'}
function Fruit({i,showAnswer,showPrediction,group}:{i:number;showAnswer:boolean;showPrediction?:boolean;group?:string}){
 const f=fruitExamples[i]
 return <Box sx={{border:'1px solid',borderColor:'divider',borderRadius:1.5,backgroundColor:'#fff',p:1.4,minWidth:0}}>
  <Stack direction="row" alignItems="center" gap={1}>
   <Box aria-hidden sx={{width:22,height:22,flexShrink:0,borderRadius:'50%',bgcolor:fruitColor[f.color],border:'2px solid #fff',boxShadow:'0 0 0 1px #CCD3DE'}}/>
   <Typography fontSize={12.5} fontWeight={800}>Fruta {f.id}</Typography>
  </Stack>
  <Typography sx={{fontSize:12,color:'text.secondary',mt:.7}}>{f.color} · casca {f.skin.toLowerCase()}</Typography>
  {group&&<Chip size="small" label={group} sx={{mt:1,borderRadius:1,fontWeight:750}}/>}
  {!group&&<Typography sx={{fontSize:12.5,mt:1,fontWeight:800,color:showPrediction?'primary.main':showAnswer?'text.primary':'text.secondary'}}>{showPrediction?`Previsão: ${f.label}`:showAnswer?f.label:'Resposta: oculta'}</Typography>}
 </Box>
}
function SampleGrid({indices,showAnswer,showPrediction,group}:{indices:number[];showAnswer:boolean;showPrediction?:boolean;group?:string}){
 return <Box sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',sm:'repeat(4,minmax(0,1fr))'},gap:1}}>{indices.map(i=><Fruit key={i} i={i} showAnswer={showAnswer} showPrediction={showPrediction} group={group}/>)}</Box>
}
function Visual({mode,step}:{mode:Mode;step:number}){
 if(mode==='supervised')return <Stack gap={2}>
  {step===0?<><Typography fontWeight={800}>Conjunto completo · 10 frutas</Typography><SampleGrid indices={fruitExamples.map((_,i)=>i)} showAnswer/></>:<>
   <Box sx={{borderLeft:'3px solid #3A79C3',pl:2}}><Typography fontWeight={850} mb={1}>TREINO · 8 frutas</Typography><SampleGrid indices={[0,1,2,3,4,5,6,7]} showAnswer={step>=1}/></Box>
   <Box sx={{borderLeft:'3px solid #DDA453',pl:2}}><Typography fontWeight={850} mb={1}>TESTE · 2 frutas</Typography><SampleGrid indices={[8,9]} showAnswer={step===4} showPrediction={step===3}/></Box>
   {step===2&&<Box sx={{bgcolor:'#E8F2FF',p:2,borderRadius:1.5}}><Typography fontWeight={800}>Uma possível pergunta aprendida</Typography><Typography fontSize={14} mt={.5}>“A casca é lisa?” → a árvore decide se precisa continuar com outra pergunta. Para acompanhar as divisões e o Gini, abra a aula de Decision Tree.</Typography></Box>}
   {step===4&&<Typography color="text.secondary" fontSize={13}>As previsões ilustradas são coerentes com este conjunto didático. Elas não representam uma avaliação estatística confiável.</Typography>}
  </>}
 </Stack>
 if(mode==='unsupervised')return <Stack gap={2}>
  {step<2?<><Typography fontWeight={800}>Entradas sem a coluna “nome”</Typography><SampleGrid indices={fruitExamples.map((_,i)=>i)} showAnswer={false}/>{step===1&&<Typography sx={{bgcolor:'#EEF4FA',p:1.8,fontSize:14}}>Exemplo de representação: cor e textura podem virar variáveis numéricas. A distância entre duas frutas dependerá dessas escolhas.</Typography>}</>:<>
   <Box sx={{borderLeft:'3px solid #3C8A79',pl:2}}><Typography fontWeight={850} mb={1}>Grupo ilustrativo A · casca lisa</Typography><SampleGrid indices={fruitExamples.map((f,i)=>f.skin==='Lisa'?i:-1).filter(i=>i>=0)} showAnswer={false} group="Grupo A"/></Box>
   <Box sx={{borderLeft:'3px solid #BD8247',pl:2}}><Typography fontWeight={850} mb={1}>Grupo ilustrativo B · casca rugosa</Typography><SampleGrid indices={fruitExamples.map((f,i)=>f.skin==='Rugosa'?i:-1).filter(i=>i>=0)} showAnswer={false} group="Grupo B"/></Box>
   {step===3&&<Typography sx={{bgcolor:'#F1F5FA',p:2,fontSize:14}}>Esses grupos foram montados por textura para explicar a ideia. Um método de agrupamento real aprenderia sua própria divisão sem consultar os nomes.</Typography>}
  </>}
 </Stack>
 return <Stack gap={2}>
  {step===0?<><Typography fontWeight={800}>O que observamos</Typography><SampleGrid indices={[0,1,2,3,4,5]} showAnswer/></>:step===1?<><Typography fontWeight={800}>Linhas = frutas · Colunas = características</Typography><Box sx={{overflowX:'auto'}}><Box component="table" sx={{width:'100%',borderCollapse:'collapse',fontSize:14,'& th, & td':{textAlign:'left',p:1.2,borderBottom:'1px solid #D8E0EB'}}}><thead><tr><th>Fruta</th><th>Cor</th><th>Casca</th><th>Resposta (quando disponível)</th></tr></thead><tbody>{fruitExamples.slice(0,5).map(f=><tr key={f.id}><td>{f.id}</td><td>{f.color}</td><td>{f.skin}</td><td>{f.label}</td></tr>)}</tbody></Box></Box></>:step===2?<Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr'},gap:2}}><Box sx={{p:2,border:'1px solid #D5DFEB',borderRadius:1.5}}><Typography fontWeight={850}>Decision Tree</Typography><Typography fontSize={14} mt={1}>Aprende perguntas como “casca lisa?” e separa os exemplos em ramos.</Typography></Box><Box sx={{p:2,border:'1px solid #D5DFEB',borderRadius:1.5}}><Typography fontWeight={850}>Random Forest</Typography><Typography fontSize={14} mt={1}>Treina várias árvores e reúne suas previsões.</Typography></Box></Box>:<><Typography fontWeight={850}>TREINO · exemplos disponíveis ao modelo</Typography><SampleGrid indices={[0,1,2,3]} showAnswer/><Typography fontWeight={850}>TESTE · exemplo reservado</Typography><SampleGrid indices={[8]} showAnswer={false} showPrediction/></>}
 </Stack>
}
export default function FoundationJourney({mode}:{mode:Mode}){
 const [step,setStep]=useState(0)
 const lesson=lessons[mode];const current=lesson.stages[step]
 return <Box sx={{my:3,p:{xs:2,md:3},bgcolor:'#F3F6FA',borderRadius:1.5}}>
  <Typography color="primary.main" fontWeight={850} fontSize={12} letterSpacing=".08em">APRENDA ACOMPANHANDO · {lesson.stages.length} ETAPAS</Typography>
  <Typography sx={{fontSize:14,lineHeight:1.8,mt:1,mb:2}}>{lesson.intro}</Typography>
  <LinearProgress variant="determinate" value={(step+1)/lesson.stages.length*100} sx={{height:5,borderRadius:4,mb:2.5}}/>
  <Stack direction="row" justifyContent="space-between" gap={1} alignItems="baseline"><Typography component="h3" sx={{fontSize:{xs:20,md:23},fontWeight:850}}>{step+1}. {current.name}</Typography><Typography color="text.secondary" fontSize={12} sx={{whiteSpace:'nowrap'}}>{step+1}/{lesson.stages.length}</Typography></Stack>
  <Typography sx={{lineHeight:1.85,mt:1.2,mb:2.5,maxWidth:770}}>{current.description}</Typography>
  <Box sx={{bgcolor:'#fff',borderRadius:1.5,p:{xs:1.5,md:2.5}}}><Visual mode={mode} step={step}/></Box>
  <Box sx={{borderLeft:'3px solid',borderColor:'primary.main',mt:2.5,pl:2,py:.5}}><Typography fontWeight={850} fontSize={13}>O que observar</Typography><Typography fontSize={14} lineHeight={1.7} mt={.5}>{current.observe}</Typography></Box>
  <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems={{sm:'center'}} gap={2} mt={3}>
   <Stack direction="row" gap={.75}>{lesson.stages.map((_,i)=><Box component="button" key={i} onClick={()=>setStep(i)} aria-label={`Abrir etapa ${i+1}`} aria-current={i===step?'step':undefined} sx={{border:0,p:0,height:8,width:i===step?28:11,borderRadius:5,bgcolor:i===step?'primary.main':'#C5D1E0',cursor:'pointer'}}/>)}</Stack>
   <Stack direction="row" gap={1}><Button disabled={step===0} onClick={()=>setStep(s=>s-1)} startIcon={<ArrowBackRoundedIcon/>}>Voltar</Button>{step===lesson.stages.length-1?<Button onClick={()=>setStep(0)} startIcon={<RestartAltRoundedIcon/>} variant="contained">Recomeçar</Button>:<Button onClick={()=>setStep(s=>s+1)} endIcon={<ArrowForwardRoundedIcon/>} variant="contained">Continuar</Button>}</Stack>
  </Stack>
 </Box>
}
