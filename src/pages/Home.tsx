import { useMemo, useState } from 'react'
import { Box, Button, Divider, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { easyLessons, nodeNamed, studyChapters, techniquePlainLanguage } from '../core/studyGuide.ts'
import { ALL } from '../techniques/registry.ts'
import FruitJourney from '../components/FruitJourney.tsx'

export default function Home(){
 const [query,setQuery]=useState('')
 const matches=useMemo(()=>{
  const q=query.trim().toLocaleLowerCase('pt')
  return q?ALL.filter(t=>`${t.name} ${t.summary} ${t.hierarchy.family}`.toLocaleLowerCase('pt').includes(q)).slice(0,7):[]
 },[query])
 const ml=nodeNamed('Aprendizado de máquina')
 const supervised=nodeNamed('Aprendizado supervisionado')
 const unsupervised=nodeNamed('Aprendizado não supervisionado')
 return <Box sx={{maxWidth:1050,mx:'auto',pb:9}}>
  <Box sx={{maxWidth:850,pt:{xs:2,md:6},pb:{xs:4,md:6}}}>
   <Typography sx={{fontWeight:850,fontSize:12,color:'primary.main',letterSpacing:'.12em',mb:2}}>ATLAS / UM JEITO MAIS SIMPLES DE ENTENDER IA</Typography>
   <Typography component="h1" sx={{fontSize:{xs:40,md:64},fontWeight:900,letterSpacing:'-.056em',lineHeight:1.11,mb:3}}>Entenda como a inteligência artificial <Box component="span" sx={{color:'primary.main'}}>funciona de verdade.</Box></Typography>
   <Typography sx={{fontSize:{xs:17,md:20},color:'text.secondary',lineHeight:1.8,maxWidth:760,mb:3.5}}>Sem precisar saber o nome de nenhum algoritmo. Começamos com uma pergunta simples, vemos exemplos, testamos nossas ideias e descobrimos quais técnicas existem para resolvê-las.</Typography>
   <Stack direction={{xs:'column',sm:'row'}} spacing={1.5} alignItems={{sm:'center'}}>
    <Button component={RouterLink} to={`/conceito/${ml?.id??''}`} variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon/>}>Começar do zero</Button>
    <Button component={RouterLink} to="/biblioteca" size="large" variant="text">Já sei o assunto que procuro</Button>
   </Stack>
  </Box>
  <Divider/>
  <Box sx={{py:{xs:5,md:7}}}>
   <Typography sx={{fontWeight:800,color:'primary.main',fontSize:12,letterSpacing:'.1em',mb:1.5}}>UM EXEMPLO QUE VAI NOS ACOMPANHAR</Typography>
   <Typography component="h2" sx={{fontSize:{xs:27,md:34},fontWeight:850,letterSpacing:'-.035em',mb:2}}>Como você ensinaria um computador a separar maçãs e laranjas?</Typography>
   <Typography sx={{fontSize:17,lineHeight:1.85,color:'text.secondary',maxWidth:770,mb:2}}>Você talvez observe a cor e a textura das frutas. O computador também pode usar essas pistas — só precisa recebê-las como dados. A partir daí, existem maneiras diferentes de procurar padrões. Experimente as três etapas abaixo.</Typography>
   <FruitJourney lesson={easyLessons['Aprendizado de máquina']}/>
   <Typography sx={{fontSize:15,color:'text.secondary',lineHeight:1.75,maxWidth:780}}>O exemplo é simplificado de propósito. Na vida real, a cor e a textura sozinhas podem não ser suficientes. No Atlas, começamos pela ideia e depois mostramos as limitações.</Typography>
  </Box>
  <Divider/>
  <Box sx={{py:{xs:5,md:7}}}>
   <Typography sx={{fontWeight:800,color:'primary.main',fontSize:12,letterSpacing:'.1em',mb:1.5}}>SEU CAMINHO DE ESTUDO</Typography>
   <Typography component="h2" sx={{fontSize:{xs:27,md:34},fontWeight:850,letterSpacing:'-.035em',mb:1}}>Um assunto leva ao próximo.</Typography>
   <Typography sx={{fontSize:17,lineHeight:1.85,color:'text.secondary',mb:3,maxWidth:770}}>Você pode seguir esta ordem como um mini curso ou abrir diretamente uma técnica. Cada capítulo mostra onde aquela ideia se encaixa e quais algoritmos a utilizam.</Typography>
   <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},columnGap:6}}>
    {studyChapters.map((node,i)=><Box key={node.id} component={RouterLink} to={`/conceito/${node.id}`} sx={{borderTop:'1px solid',borderColor:'divider',display:'flex',alignItems:'start',gap:2,py:2.5,color:'text.primary',textDecoration:'none','&:hover':{color:'primary.main'}}}>
     <Typography sx={{fontSize:12,color:'primary.main',fontWeight:850,pt:.5}}>{String(i+1).padStart(2,'0')}</Typography>
     <Box sx={{flex:1}}><Typography fontWeight={850} sx={{fontSize:18}}>{node.name==='Modelos baseados em árvores'?'Árvores de decisão':node.name}</Typography><Typography sx={{color:'text.secondary',fontSize:14,lineHeight:1.7,mt:.4}}>{easyLessons[node.name]?.subtitle??node.description}</Typography></Box>
     <ArrowForwardRoundedIcon fontSize="small"/>
    </Box>)}
   </Box>
   <Stack direction={{xs:'column',sm:'row'}} gap={1.5} sx={{mt:3}}>
    {supervised&&<Button component={RouterLink} variant="outlined" to={`/conceito/${supervised.id}`}>Entender aprendizado supervisionado</Button>}
    {unsupervised&&<Button component={RouterLink} variant="outlined" to={`/conceito/${unsupervised.id}`}>Entender não supervisionado</Button>}
   </Stack>
  </Box>
  <Divider/>
  <Box sx={{pt:{xs:5,md:7},maxWidth:760}}>
   <Typography component="h2" sx={{fontSize:{xs:27,md:34},fontWeight:850,mb:1}}>Já ouviu falar de uma técnica?</Typography>
   <Typography color="text.secondary" sx={{lineHeight:1.8,mb:2}}>Não precisa seguir os capítulos. Digite o nome e vá direto para a página do algoritmo.</Typography>
   <TextField fullWidth size="medium" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar: árvore de decisão, K-means, rede neural..." inputProps={{'aria-label':'Buscar técnica pelo nome'}} InputProps={{startAdornment:<InputAdornment position="start"><SearchRoundedIcon color="action"/></InputAdornment>}}/>
   {query.trim()&&<Box role="region" aria-label="Resultados da pesquisa" sx={{borderTop:'1px solid',borderColor:'divider',mt:1}}>{matches.length?matches.map(t=><Box key={t.id} component={RouterLink} to={`/tecnica/${t.id}`} sx={{display:'flex',justifyContent:'space-between',gap:2,py:1.8,borderBottom:'1px solid',borderColor:'divider',textDecoration:'none',color:'text.primary','&:hover':{color:'primary.main'}}}>
    <Box><Typography fontWeight={800}>{t.name}</Typography><Typography fontSize={13} color="text.secondary" sx={{mt:.4}}>{techniquePlainLanguage[t.id]?.short??t.summary}</Typography></Box><ArrowForwardRoundedIcon fontSize="small"/>
   </Box>):<Typography color="text.secondary" sx={{py:2}}>Não encontramos essa técnica. Tente outro termo.</Typography>}</Box>}
  </Box>
 </Box>
}
