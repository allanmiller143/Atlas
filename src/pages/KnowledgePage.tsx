import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Breadcrumbs, Button, Chip, Divider, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import { ancestorsOf, childrenOf, knowledgeById, knowledgeId } from '../core/knowledge.ts'
import { advancedExamples } from '../core/advancedExamples.ts'
import { chapterAround, easyLessons, nodeNamed, relevantTechniques, shortIntroductions, studyChapters, techniquePlainLanguage } from '../core/studyGuide.ts'
import FruitJourney from '../components/FruitJourney.tsx'
import FoundationsChapters from '../features/foundations/FoundationsChapters.tsx'
import SupervisedJourney from '../components/SupervisedJourney.tsx'
import SupervisedComparison from '../components/SupervisedComparison.tsx'
import { TreeFamilyGuide } from '../components/TreeFamilyGuide.tsx'
import TreeModelsChapter from '../features/tree-models/TreeModelsChapter.tsx'
import NeuralNetworksChapter from '../features/neural-networks/NeuralNetworksChapter.tsx'
import LearningDemo from '../components/LearningDemo.tsx'
import type { Technique } from '../core/types.ts'

const readable = { fontSize:{xs:16,md:17},lineHeight:1.85,color:'text.primary',mb:2.2,maxWidth:760 }
const heading = { fontSize:{xs:25,md:31},letterSpacing:'-.035em',fontWeight:850,lineHeight:1.25,mb:2 }
const linkSx={color:'primary.main',fontWeight:700,textDecoration:'none','&:hover':{textDecoration:'underline'}}

function Section({id,kicker,title,children}:{id:string;kicker:string;title:string;children:React.ReactNode}){
 return <Box component="section" id={id} sx={{scrollMarginTop:80,pt:{xs:5,md:6},pb:2,borderTop:'1px solid',borderColor:'divider'}}>
  <Typography sx={{color:'primary.main',fontSize:12,fontWeight:850,mb:1.5,letterSpacing:'.075em'}}>{kicker}</Typography>
  <Typography component="h2" sx={heading}>{title}</Typography>{children}
 </Box>
}
function ModelLink({t}:{t:Technique}){
 return <Chip component={RouterLink} to={`/tecnica/${t.id}`} clickable
  label={`${t.name}${t.status==='planned'?' · em preparação':''}`}
  size="medium" variant="outlined"
  sx={{height:'auto',minHeight:32,borderRadius:1,backgroundColor:'#FFF',fontWeight:650,'& .MuiChip-label':{whiteSpace:'normal',py:.65},'&:hover':{backgroundColor:'#EBF2FC',borderColor:'primary.main'}}}/>
}
function TechniqueLinks({items}:{items:Technique[]}){
 return <Stack direction="row" gap={1} useFlexGap flexWrap="wrap" sx={{my:2}}>{items.map(t=><ModelLink key={t.id} t={t}/>)}</Stack>
}
function Approaches(){
 const supervised=nodeNamed('Aprendizado supervisionado')
 const unsupervised=nodeNamed('Aprendizado não supervisionado')
 const views=[
  {node:supervised,name:'Supervisionado',line:'Aprender com as respostas',subtitle:'Mostramos as frutas e contamos o nome de cada uma. O modelo tenta prever o nome de outra fruta.',tag:'Com etiqueta',answer:'Maçã / Laranja',examples:supervised?relevantTechniques(supervised).filter(t=>['arvore-de-decisao','random-forest','rede-neural-mlp','regressao-logistica','knn'].includes(t.id)):[]},
  {node:unsupervised,name:'Não supervisionado',line:'Descobrir sem receber as respostas',subtitle:'Mostramos as mesmas frutas, mas escondemos os nomes. O método procura o que é parecido.',tag:'Sem etiqueta',answer:'?',examples:unsupervised?relevantTechniques(unsupervised).filter(t=>['k-means','dbscan','som','pca'].includes(t.id)):[]},
 ]
 return <>
  <Typography sx={readable}>Imagine que temos exatamente as mesmas frutas. A diferença não é a fruta: <strong>é a informação que entregamos ao computador e o que queremos descobrir.</strong></Typography>
  <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},gap:{xs:4,md:5},my:4}}>
   {views.map(v=><Box key={v.name} sx={{borderTop:'3px solid',borderColor:v.name==='Supervisionado'?'primary.main':'secondary.main',pt:2.2}}>
    <Typography sx={{fontSize:12,fontWeight:800,letterSpacing:'.08em',color:'text.secondary'}}>{v.tag.toUpperCase()}</Typography>
    <Typography component="h3" sx={{fontSize:24,fontWeight:850,mt:.6}}>{v.name}</Typography>
    <Typography fontWeight={700} sx={{mt:1}}>{v.line}</Typography>
    <Typography sx={{lineHeight:1.75,color:'text.secondary',mt:1}}>{v.subtitle}</Typography>
    <Box sx={{my:2.5,backgroundColor:'#F4F6FA',px:2,py:1.5}}>
     <Stack direction="row" justifyContent="space-between" sx={{borderBottom:'1px solid #DDE4ED',pb:1,mb:1}}><Typography fontWeight={750} fontSize={12}>Pistas</Typography><Typography fontWeight={750} fontSize={12}>Resposta</Typography></Stack>
     <Stack direction="row" justifyContent="space-between"><Typography fontSize={13}>Vermelha · casca lisa</Typography><Typography fontSize={13} color={v.answer==='?'?'text.secondary':'primary.main'} fontWeight={750}>{v.answer==='?'?'?':'Maçã'}</Typography></Stack>
     <Stack direction="row" justifyContent="space-between" sx={{mt:1}}><Typography fontSize={13}>Alaranjada · rugosa</Typography><Typography fontSize={13} color={v.answer==='?'?'text.secondary':'primary.main'} fontWeight={750}>{v.answer==='?'?'?':'Laranja'}</Typography></Stack>
    </Box>
    <Typography sx={{fontSize:13,fontWeight:800,mt:2}}>Exemplos de técnicas</Typography>
    <TechniqueLinks items={v.examples}/>
    {v.node&&<Button component={RouterLink} to={`/conceito/${v.node.id}`} variant="text" endIcon={<ArrowForwardRoundedIcon/>} sx={{pl:0}}>Entender {v.name.toLowerCase()}</Button>}
   </Box>)}
  </Box>
  <Box sx={{overflowX:'auto',borderTop:'1px solid',borderColor:'divider',mb:2}}><Table size="small" sx={{'& .MuiTableCell-root':{px:1.6,py:1.5}}}>
   <TableHead><TableRow><TableCell sx={{fontWeight:800}}>Pergunta</TableCell><TableCell sx={{fontWeight:800}}>Supervisionado</TableCell><TableCell sx={{fontWeight:800}}>Não supervisionado</TableCell></TableRow></TableHead>
   <TableBody>
    {[['O que recebe?','Características + respostas','Só características'],['O que tentamos fazer?','Prever uma resposta','Encontrar padrões ou grupos'],['Qual seria o resultado na feira?','Previsão: “é uma maçã”','Grupos de frutas semelhantes']].map(row=><TableRow key={row[0]}><TableCell sx={{fontWeight:700,minWidth:148}}>{row[0]}</TableCell><TableCell>{row[1]}</TableCell><TableCell>{row[2]}</TableCell></TableRow>)}
   </TableBody>
  </Table></Box>
  <Typography sx={{fontSize:14,color:'text.secondary',lineHeight:1.8}}>Existem outras abordagens, como o <Link component={RouterLink} to={`/conceito/${nodeNamed('Aprendizado por reforço')?.id ?? ''}`} sx={linkSx}>aprendizado por reforço</Link>, que aprende com ações e recompensas. Vamos começar por estas duas porque ajudam a entender a maior parte dos exemplos deste caderno.</Typography>
 </>
}
function CompareModels({techniques}:{techniques:Technique[]}){
 if(!techniques.length)return null
 const selected = [...techniques].sort((a,b)=>(a.status==='ready'?0:1)-(b.status==='ready'?0:1)).slice(0,6)
 return <Box sx={{overflowX:'auto',my:3,borderTop:'1px solid',borderColor:'divider'}}>
  <Table size="small" sx={{'& .MuiTableCell-root':{px:1.5,py:1.9,verticalAlign:'top'}}}>
   <TableHead><TableRow><TableCell sx={{fontWeight:800,minWidth:120}}>Técnica</TableCell><TableCell sx={{fontWeight:800,minWidth:230}}>Como ela funciona, sem complicar</TableCell><TableCell sx={{fontWeight:800,minWidth:175}}>Por que conhecer?</TableCell></TableRow></TableHead>
   <TableBody>{selected.map(t=><TableRow key={t.id}>
    <TableCell><Link component={RouterLink} to={`/tecnica/${t.id}`} sx={linkSx}>{t.name}</Link></TableCell>
    <TableCell sx={{lineHeight:1.65}}>{techniquePlainLanguage[t.id]?.short??t.summary}</TableCell>
    <TableCell sx={{lineHeight:1.65}}>{techniquePlainLanguage[t.id]?.compare??'Veja o exemplo na página da técnica'}</TableCell>
   </TableRow>)}</TableBody>
  </Table>
  <Typography sx={{fontSize:13,color:'text.secondary',lineHeight:1.7,mt:1}}>Esta tabela compara ideias, não afirma qual técnica é a melhor. A escolha depende dos dados, da tarefa e dos resultados medidos.</Typography>
 </Box>
}
function LearningConnections({name}:{name:string}){
 const map: Record<string,{name:string;why:string}[]> = {
  'Aprendizado de máquina':[{name:'Aprendizado supervisionado',why:'Comece pelos exemplos que já vêm com as respostas.'},{name:'Aprendizado não supervisionado',why:'Descubra como analisar dados sem etiquetas.'},{name:'Redes neurais',why:'Conheça uma família de modelos que aparece em várias tarefas.'}],
  'Aprendizado supervisionado':[{name:'Modelos baseados em árvores',why:'Veja um modelo que aprende fazendo perguntas.'},{name:'Redes neurais',why:'Veja outra forma de resolver tarefas semelhantes, ajustando pesos.'},{name:'Aprendizado não supervisionado',why:'Compare com o aprendizado sem respostas.'}],
  'Aprendizado não supervisionado':[{name:'Agrupamento',why:'Veja como encontrar grupos com K-means e DBSCAN.'},{name:'Aprendizado supervisionado',why:'Relembre como as etiquetas mudam o problema.'},{name:'Redes neurais',why:'Algumas redes, como o SOM, também exploram dados sem etiquetas.'}],
  'Modelos baseados em árvores':[{name:'Aprendizado supervisionado',why:'Retorne ao tipo de aprendizado em que árvores são usadas.'},{name:'Redes neurais',why:'Compare perguntas e ramos com pesos e camadas.'}],
  'Redes neurais':[{name:'Aprendizado supervisionado',why:'Entenda o uso de redes para prever etiquetas.'},{name:'Aprendizado não supervisionado',why:'Conheça também redes que organizam dados sem rótulos.'},{name:'Modelos baseados em árvores',why:'Compare uma rede com um modelo baseado em perguntas.'}],
  'Agrupamento':[{name:'Aprendizado não supervisionado',why:'Volte ao problema maior de descobrir padrões.'},{name:'Aprendizado supervisionado',why:'Entenda o que seria diferente se houvesse respostas conhecidas.'}],
 }
 const options=(map[name]??[{name:'Aprendizado de máquina',why:'Volte aos fundamentos e veja como este assunto se encaixa na área.'}]).map(x=>({ ...x,node:nodeNamed(x.name)})).filter(x=>x.node)
 return <Box sx={{borderTop:'1px solid',borderColor:'divider'}}>
  {options.map(x=><Box key={x.name} component={RouterLink} to={`/conceito/${x.node!.id}`} sx={{textDecoration:'none',display:'flex',alignItems:'center',gap:2,py:2.2,borderBottom:'1px solid',borderColor:'divider',color:'text.primary','&:hover':{color:'primary.main'}}}>
    <Box sx={{flex:1}}><Typography fontWeight={800} sx={{fontSize:17}}>{x.name}</Typography><Typography color="text.secondary" sx={{fontSize:14,lineHeight:1.7,mt:.4}}>{x.why}</Typography></Box><ArrowForwardRoundedIcon fontSize="small"/>
   </Box>)}
 </Box>
}
function Advanced({nodeName}:{nodeName:string}){
 const lesson=advancedExamples[nodeName]
 if(!lesson)return null
 return <Box sx={{pt:4,mb:4}}>
  <Accordion disableGutters elevation={0} sx={{borderTop:'1px solid',borderBottom:'1px solid',borderColor:'divider','&:before':{display:'none'}}}>
   <AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>} sx={{px:0,py:1}}><Box><Typography fontWeight={850} fontSize={20}>Quer ir além? Matemática e Python</Typography><Typography color="text.secondary" sx={{fontSize:14}}>Opcional. Você não precisa disso para entender o capítulo.</Typography></Box></AccordionSummary>
   <AccordionDetails sx={{px:0,pb:3}}>
    <Typography fontWeight={800} sx={{mb:1}}>A ideia em uma fórmula</Typography>
    <Box component="pre" sx={{whiteSpace:'pre-wrap',overflowX:'auto',backgroundColor:'#F2F5F9',p:2.5,fontSize:16,fontFamily:'monospace'}}>{lesson.math}</Box>
    <Typography color="text.secondary" sx={{lineHeight:1.75,mb:3}}>{lesson.mathExplanation}</Typography>
    <Typography fontWeight={800} sx={{mb:1}}>Primeiro contato com Python</Typography>
    <Typography sx={{fontSize:14,lineHeight:1.8,mb:1.5}}>Código demonstrativo. Algumas variáveis de dados precisam ser preparadas antes da execução; os exemplos com frutas da página são ilustrações, não dados científicos.</Typography>
    <Box component="pre" sx={{whiteSpace:'pre',overflowX:'auto',backgroundColor:'#172333',color:'#EAF0F8',p:2.5,fontSize:13,lineHeight:1.85,fontFamily:'monospace'}}>{lesson.code}</Box>
    {lesson.notes.map((note,i)=><Typography key={i} sx={{fontSize:14,lineHeight:1.8,mt:1}}>{i+1}. {note}</Typography>)}
   </AccordionDetails>
  </Accordion>
 </Box>
}
export default function KnowledgePage(){
 const {id}=useParams()
 const node=knowledgeById(id)
 if(!node && id === knowledgeId('family','Ensembles de árvores','Aprendizado de máquina/Aprendizado supervisionado'))return <Navigate to={`/conceito/${knowledgeId('family','Modelos baseados em árvores','Aprendizado de máquina/Aprendizado supervisionado')}`} replace/>
 if(!node)return <Alert severity="warning">Assunto não encontrado. <Link component={RouterLink} to="/biblioteca">Abrir índice</Link></Alert>
 const foundationPage = node.name==='Aprendizado de máquina'?'ml':node.name==='Aprendizado supervisionado'?'supervised':node.name==='Aprendizado não supervisionado'?'unsupervised':null
 if(foundationPage)return <FoundationsChapters key={node.id} mode={foundationPage}/>
 if(node.name==='Modelos baseados em árvores')return <TreeModelsChapter key={node.id}/>
 if(node.name==='Redes neurais')return <NeuralNetworksChapter key={node.id}/>
 const guide=easyLessons[node.name]
 const short=shortIntroductions[node.name]
 const techniques=relevantTechniques(node)
 const {previous,next}=chapterAround(node.id)
 const subtopics=childrenOf(node.id)
 const isMachineLearning=node.name==='Aprendizado de máquina'
 return <Box sx={{maxWidth:1050,mx:'auto',pb:9}}>
  <Breadcrumbs sx={{mb:{xs:3,md:5},fontSize:13}}><Link component={RouterLink} to="/" underline="hover">Início</Link>{ancestorsOf(node).map((a,i,arr)=>i===arr.length-1?<Typography key={a.id} variant="body2" color="text.primary">{a.name}</Typography>:<Link key={a.id} component={RouterLink} to={`/conceito/${a.id}`} underline="hover">{a.name}</Link>)}</Breadcrumbs>
  <Box sx={{maxWidth:790,mb:{xs:4,md:6}}}>
   <Typography sx={{fontSize:12,color:'primary.main',fontWeight:800,letterSpacing:'.11em',mb:1.7}}>{guide?'APRENDA PASSO A PASSO':'EXPLORE O ASSUNTO'} · ATLAS</Typography>
   <Typography component="h1" sx={{fontSize:{xs:'2.5rem',md:'3.65rem'},fontWeight:900,letterSpacing:'-.05em',lineHeight:1.14,mb:2.2}}>{node.name}</Typography>
   <Typography sx={{fontSize:{xs:19,md:22},lineHeight:1.6,color:'text.secondary'}}>{guide?.subtitle??`Conheça as ideias e os modelos relacionados a ${node.name.toLowerCase()}.`}</Typography>
  </Box>
  <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',xl:'minmax(0,780px) minmax(0,180px)'},gap:{xl:6}}}>
   <Box sx={{minWidth:0}}>
    {guide ? <>
     <Box component="section" sx={{pb:2}}>{guide.opening.map((p,i)=><Typography key={i} sx={readable}>{p}</Typography>)}
      <Box sx={{borderLeft:'3px solid',borderColor:'primary.main',pl:2.2,mt:3,mb:4}}><Typography sx={{fontSize:12,color:'primary.main',fontWeight:850,letterSpacing:'.06em',mb:.7}}>EM OUTRAS PALAVRAS</Typography><Typography sx={{fontWeight:850,fontSize:19,mb:1}}>{guide.question}</Typography><Typography sx={{lineHeight:1.8,fontSize:16}}>{guide.answer}</Typography></Box>
     </Box>
     <Section id="na-pratica" kicker="APRENDA FAZENDO" title={guide.sectionTitle}>
      <Typography sx={readable}>{guide.commonExample}</Typography>
      <FruitJourney key={node.id} lesson={guide}/>
      <Typography sx={{fontWeight:700,color:'primary.dark',lineHeight:1.75,mt:2}}>{guide.insight}</Typography>
     </Section>
     {isMachineLearning&&<Section id="caminhos" kicker="ENTENDA A DIFERENÇA" title="Dois caminhos para aprender com dados"><Approaches/></Section>}
     {!isMachineLearning&&node.name==='Redes neurais'&&<Section id="laboratorio" kicker="UM PEQUENO EXPERIMENTO" title="Mude os pesos e veja a previsão mudar">
      <Typography sx={readable}>Agora que você entendeu que os pesos controlam a influência das entradas, tente alterá-los no laboratório. É um <strong>único neurônio simplificado</strong>, não uma rede treinada para reconhecer frutas.</Typography>
      <LearningDemo/>
     </Section>}
    </>:<Box component="section" sx={{pb:4}}>
     <Typography sx={readable}>{short?.opening??'Esta página ajuda a explorar modelos relacionados a este assunto. Abra uma técnica da lista para estudar seu funcionamento.'}</Typography>
     {short&&<Box sx={{backgroundColor:'#F2F6FA',p:2.5,my:3}}><Typography sx={{fontWeight:850,mb:1}}>Um exemplo para entender</Typography><Typography sx={{lineHeight:1.85}}>{short.example}</Typography><Typography sx={{mt:1.5,fontWeight:750,color:'primary.dark',lineHeight:1.7}}>{short.next}</Typography></Box>}
     {subtopics.length>0&&<Box sx={{mt:3}}><Typography sx={heading}>O que está dentro deste assunto?</Typography>{subtopics.map(child=><Box key={child.id} component={RouterLink} to={`/conceito/${child.id}`} sx={{display:'flex',alignItems:'center',justifyContent:'space-between',py:2.2,borderTop:'1px solid',borderColor:'divider',color:'text.primary',textDecoration:'none','&:hover':{color:'primary.main'}}}><Typography fontWeight={750}>{child.name}</Typography><ArrowForwardRoundedIcon fontSize="small"/></Box>)}</Box>}
    </Box>}
    {node.name==='Aprendizado supervisionado'&&<><Section id="classificacao-regressao" kicker="DOIS TIPOS DE RESPOSTA" title="Classificação ou regressão: qual é a diferença?"><Typography sx={readable}>No mesmo aprendizado supervisionado podemos pedir duas coisas diferentes. Se a resposta é um <strong>nome</strong>, como maçã ou laranja, fazemos classificação. Se a resposta é um <strong>número</strong>, como o peso estimado de uma fruta, fazemos regressão. O algoritmo aprende com exemplos que têm a resposta correta nos dois casos.</Typography><Box sx={{overflowX:'auto',mt:2}}><Table size="small"><TableHead><TableRow><TableCell sx={{fontWeight:850}}>Pergunta</TableCell><TableCell sx={{fontWeight:850}}>Classificação</TableCell><TableCell sx={{fontWeight:850}}>Regressão</TableCell></TableRow></TableHead><TableBody>{[['O que prever?','Uma categoria','Um número'],['Exemplo','É maçã ou laranja?','Quanto pesa a fruta?'],['Como avaliar?','Comparar classes previstas e reais','Medir a distância entre números previstos e reais']].map(r=><TableRow key={r[0]}>{r.map((v,i)=><TableCell key={i} sx={{fontWeight:i===0?750:400}}>{v}</TableCell>)}</TableRow>)}</TableBody></Table></Box></Section><SupervisedComparison/></>}
    {node.name==='Modelos baseados em árvores'&&<TreeFamilyGuide/>}
    <Section id="modelos" kicker="DO CONCEITO PARA OS ALGORITMOS" title="E quais técnicas usam essas ideias?">
     <Typography sx={readable}>{isMachineLearning?'Agora você já sabe que não existe um algoritmo chamado “aprendizado de máquina”. Cada técnica abaixo é uma maneira diferente de aprender ou encontrar padrões. Você pode abrir qualquer uma diretamente.':`Estas são técnicas relacionadas a ${node.name.toLowerCase()}. Clique em uma para entender a ideia e, quando houver laboratório disponível, testar com dados.`}</Typography>
     {techniques.length>0?<><TechniqueLinks items={techniques}/><Typography component="h3" sx={{fontSize:21,fontWeight:850,mt:4}}>Comparação rápida, em linguagem simples</Typography><Typography color="text.secondary" sx={{lineHeight:1.75,mt:1}}>Veja como alguns modelos se diferenciam antes de escolher qual estudar.</Typography><CompareModels techniques={techniques}/></>:<Typography sx={readable}>Ainda não há modelos cadastrados nesta seção.</Typography>}
     <Button component={RouterLink} to="/comparar" endIcon={<ArrowForwardRoundedIcon/>} sx={{pl:0,mt:1}}>Abrir comparação interativa de modelos</Button>
    </Section>
    <Section id="conexoes" kicker="CONTINUE APRENDENDO" title="Como este assunto se conecta aos outros?">
     <Typography sx={readable}>Você não precisa decorar tudo de uma vez. Escolha o assunto que responde à sua próxima pergunta:</Typography>
     <LearningConnections name={node.name}/>
    </Section>
    {guide&&<Advanced nodeName={node.name}/>}
    <Divider sx={{mt:5,mb:3}}/>
    <Stack direction={{xs:'column',sm:'row'}} alignItems={{sm:'center'}} justifyContent="space-between" gap={2}>
     {previous?<Button component={RouterLink} to={`/conceito/${previous.id}`} startIcon={<ArrowBackRoundedIcon/>}>Anterior: {previous.name}</Button>:<Button component={RouterLink} to="/" startIcon={<ArrowBackRoundedIcon/>}>Voltar à página inicial</Button>}
     {next?<Button component={RouterLink} to={`/conceito/${next.id}`} variant="contained" endIcon={<ArrowForwardRoundedIcon/>}>Próximo: {next.name}</Button>:<Button component={RouterLink} to={`/conceito/${studyChapters[0]?.id??''}`} variant="contained" endIcon={<AutoStoriesOutlinedIcon/>}>Rever fundamentos</Button>}
    </Stack>
   </Box>
   <Box component="nav" aria-label="Neste capítulo" sx={{display:{xs:'none',xl:'block'},position:'sticky',top:36,alignSelf:'start',pl:2.2,borderLeft:'1px solid',borderColor:'divider'}}>
    <Typography sx={{fontWeight:850,fontSize:11,letterSpacing:'.11em',color:'text.secondary',mb:1}}>NESTA PÁGINA</Typography>
    {([['na-pratica','O exemplo'],...(isMachineLearning?[['caminhos','Dois caminhos']]:[]),...(node.name==='Aprendizado supervisionado'?[['comparacao-supervisionada','Comparar modelos']]:[]),...(node.name==='Redes neurais'?[['laboratorio','Laboratório']]:[]),['modelos','Técnicas'],['conexoes','Outros assuntos']] as string[][]).map(([anchor,label])=><Box key={anchor} component="a" href={`#${anchor}`} sx={{display:'block',color:'text.secondary',fontSize:13,textDecoration:'none',py:.9,'&:hover':{color:'primary.main'}}}>{label}</Box>)}
   </Box>
  </Box>
 </Box>
}
