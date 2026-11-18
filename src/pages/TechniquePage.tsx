import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Grid, Link, Paper, Stack, TextField, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded'
import { byId } from '../techniques/registry.ts'
import { nodeForTechnique } from '../core/knowledge.ts'
import { techniquePlainLanguage } from '../core/studyGuide.ts'
import type { ReadyTechnique } from '../core/types.ts'
import { useDataset } from '../state/useDataset.ts'
import { usePlayground } from '../state/usePlayground.ts'
import { useNote } from '../state/useNote.ts'
import { useCompare } from '../state/compare.tsx'
import { ParamControl } from '../components/ParamControl.tsx'
import { PlaygroundCanvas } from '../components/PlaygroundCanvas.tsx'
import { DatasetBar } from '../components/DatasetBar.tsx'
import TechniqueDeepDive from '../components/TechniqueDeepDive.tsx'
import AlgorithmJourney from '../components/AlgorithmJourney.tsx'
import DecisionTreeLesson from '../features/decision-tree/DecisionTreeLesson.tsx'
import DecisionTreeFruitLab from '../features/decision-tree/DecisionTreeFruitLab.tsx'
import DecisionTreeTradeoffs from '../features/decision-tree/DecisionTreeTradeoffs.tsx'
import RandomForestLesson from '../features/random-forest/RandomForestLesson.tsx'
import CodeNotebook from '../components/learning/CodeNotebook.tsx'
import { decisionTreePythonCells } from '../features/decision-tree/pythonCells.ts'
import ParameterGuide from '../components/ParameterGuide.tsx'
import GuidedPlayground from '../components/GuidedPlayground.tsx'
import { TreeFamilyGuide } from '../components/TreeFamilyGuide.tsx'
import { EXPLAIN_LABEL, LEARNING_LABEL, OUTPUT_LABEL } from '../core/taxonomy.ts'

export default function TechniquePage(){
 const {id}=useParams(); const t=byId(id)
 if(!t)return <Stack spacing={2}><Typography variant="h2">Técnica não encontrada</Typography><Button component={RouterLink} to="/biblioteca" startIcon={<ArrowBackRoundedIcon/>}>Voltar à biblioteca</Button></Stack>
 if(t.status==='planned')return <Stack spacing={2.5} sx={{maxWidth:790,pb:6}}>
  <Button component={RouterLink} to={nodeForTechnique(t.id,'concept') ? `/conceito/${nodeForTechnique(t.id,'concept')!.id}` : '/biblioteca'} startIcon={<ArrowBackRoundedIcon/>} sx={{alignSelf:'flex-start'}}>Voltar: {t.hierarchy.concept}</Button>
  <Typography variant="overline" color="primary.main" fontWeight={850}>TÉCNICA · {t.hierarchy.family}</Typography>
  <Typography variant="h1" sx={{fontSize:{xs:'2.5rem',md:'3.6rem'}}}>{t.name}</Typography>
  <Typography sx={{fontSize:20,lineHeight:1.75}}>{techniquePlainLanguage[t.id]?.short??t.summary}</Typography>
  <Box sx={{borderTop:'1px solid',borderColor:'divider',pt:3}}><Typography variant="h5" fontWeight={850} gutterBottom>Onde isso se encaixa?</Typography><Typography sx={{lineHeight:1.85,color:'text.secondary'}}>Esta técnica pertence à família {t.hierarchy.family.toLowerCase()}, dentro de {t.hierarchy.concept.toLowerCase()}. Você pode rever a ideia principal antes de estudar os detalhes.</Typography></Box>
  {t.compareGroups.includes('Modelos baseados em árvores')&&<TreeFamilyGuide/>}
  <Alert severity="info">A página introdutória já está disponível. A demonstração interativa específica desta técnica ainda está em preparação.</Alert>
  <Stack direction={{xs:'column',sm:'row'}} gap={1.5}><Button component={RouterLink} variant="contained" to={nodeForTechnique(t.id,'concept')?`/conceito/${nodeForTechnique(t.id,'concept')!.id}`:'/biblioteca'}>Entender o conceito primeiro</Button><Button component={RouterLink} to="/biblioteca">Ver outras técnicas</Button></Stack>
 </Stack>
 const Page=TECHNIQUE_PAGE_REGISTRY[t.id] ?? TechniqueView
 return <Page key={t.id} t={t}/>
}
function TechniqueView({t}:{t:ReadyTechnique}){
 const ds=useDataset(); const [brushRaw,setBrush]=useState(0); const brush=Math.min(brushRaw,ds.data.classes-1); const play=usePlayground(t,ds.data); const [note,setNote]=useNote(t.id); const {ids,add}=useCompare(); const inDock=ids.includes(t.id); const q=encodeURIComponent(t.searchTerms)
 return <Stack spacing={3} sx={{width:'100%',maxWidth:1160,mx:'auto',minWidth:0}}>
  <Button component={RouterLink} to={nodeForTechnique(t.id,'concept') ? `/conceito/${nodeForTechnique(t.id,'concept')!.id}` : '/biblioteca'} startIcon={<ArrowBackRoundedIcon/>} sx={{alignSelf:'flex-start'}}>Rever o conceito: {t.hierarchy.concept}</Button>
  <Box><Typography variant="overline" color="primary.main" fontWeight={800}>{t.hierarchy.area} · {t.hierarchy.concept} · {t.hierarchy.family}</Typography><Typography variant="h1" sx={{fontSize:{xs:'2.5rem',md:'3.5rem'},mt:.5}}>{t.name}</Typography><Typography color="text.secondary" sx={{fontSize:'1.1rem',mt:1,maxWidth:780,lineHeight:1.7}}>{t.summary}</Typography><Stack direction="row" flexWrap="wrap" gap={.8} sx={{mt:2}}>{t.traits.learning.map(l=><Chip key={l} label={LEARNING_LABEL[l]} size="small"/>)}{t.traits.output.map(o=><Chip key={o} label={OUTPUT_LABEL[o]} size="small"/>)}<Chip label={EXPLAIN_LABEL[t.traits.explainability]} size="small"/></Stack></Box>
  <Box sx={{maxWidth:790,borderLeft:'3px solid',borderColor:'primary.main',pl:2.5,py:.8}}><Typography fontWeight={850} sx={{fontSize:18,mb:1}}>Em outras palavras</Typography><Typography sx={{lineHeight:1.8}}>{techniquePlainLanguage[t.id]?.short??t.explain.what}</Typography><Typography sx={{lineHeight:1.7,fontSize:14,color:'text.secondary',mt:1}}>{t.id==='arvore-de-decisao'?'Vamos estudar o processo com as mesmas frutas, do começo ao fim.': 'No laboratório usaremos pontos fictícios com duas características.'}</Typography></Box>
  {t.id==='arvore-de-decisao'?<DecisionTreeLesson/>:<><AlgorithmJourney technique={t}/><TechniqueDeepDive technique={t}/></>}
  <ParameterGuide technique={t}/>
  {t.id==='arvore-de-decisao'?<DecisionTreeFruitLab/>:<Grid container spacing={2} alignItems="stretch">
   <Grid item xs={12} lg={4}><Card sx={{height:'100%'}}><CardContent sx={{p:2.5}}><Stack spacing={2}><Box><Typography variant="h6" fontWeight={750}>Experimente a técnica</Typography><Typography variant="body2" color="text.secondary">Escolha um parâmetro na tabela explicativa acima, altere-o aqui e observe o efeito no gráfico. O modelo é treinado novamente com os pontos exibidos.</Typography></Box><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle2">Parâmetros</Typography><Button size="small" startIcon={<RestartAltRoundedIcon/>} onClick={play.reset}>Restaurar</Button></Stack><Divider/>{t.params.map(p=><ParamControl key={p.key} param={p} value={play.values[p.key]} onChange={v=>play.setValue(p.key,v)}/>)}<Divider/>{play.accuracy!==null&&<Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Acerto no treino (não é teste)</Typography><Typography fontWeight={800}>{Math.round(play.accuracy*100)}%</Typography></Stack>}{play.model?.stats?.map(s=><Stack key={s.label} direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">{s.label}</Typography><Typography fontWeight={700}>{s.value}</Typography></Stack>)}{play.accuracy!==null&&<Alert severity="info">O acerto é medido nos mesmos pontos usados para treinar. Um número alto aqui não garante que o modelo vá bem com dados novos.</Alert>}<Button variant="outlined" startIcon={<CompareArrowsRoundedIcon/>} disabled={inDock} onClick={()=>add(t.id)}>{inDock?'Na comparação':'Adicionar à comparação'}</Button></Stack></CardContent></Card></Grid>
   <Grid item xs={12} lg={8}><Card sx={{height:'100%'}}><CardContent sx={{p:{xs:1.5,md:2.5}}}><Stack spacing={2}><Typography variant="h6" fontWeight={750}>Laboratório: veja a previsão mudar</Typography><GuidedPlayground technique={t}/><Typography sx={{fontSize:14,lineHeight:1.7,color:"text.secondary"}}>Cada ponto é um exemplo fictício com duas características (posição horizontal e vertical). As cores indicam a classe ou o grupo. O modelo aprende usando esses pontos; altere os controles e veja como muda o resultado. <strong>Esta simulação não usa frutas nem um conjunto de teste separado.</strong></Typography><Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",sm:"repeat(3,1fr)"},gap:1.5,bgcolor:"#F2F6FB",p:2}}>{[["1. Escolha os dados","Troque o formato para ver outro desafio."],["2. Mude um parâmetro","O modelo é reajustado automaticamente."],["3. Observe as cores","Compare as regiões previstas com os pontos."]].map(([title,description])=><Box key={title}><Typography fontWeight={800} fontSize={13}>{title}</Typography><Typography color="text.secondary" fontSize={12} lineHeight={1.6}>{description}</Typography></Box>)}</Box><DatasetBar ds={ds} brush={brush} setBrush={setBrush}/><PlaygroundCanvas data={ds.data} model={play.model} supervised={t.supervised} brush={brush} onPointsChange={ds.setPoints}/><Typography variant="caption" color="text.secondary">O eixo horizontal e o vertical representam duas características numéricas fictícias (entre 0 e 1). Arraste pontos para movê-los. Clique no espaço vazio para criar um ponto e dê dois cliques num ponto para apagá-lo. {t.supervised?'Os anéis escuros indicam classificações incorretas.':'As cores mostram os grupos encontrados.'}</Typography></Stack></CardContent></Card></Grid>
  </Grid>}
  {t.id==='arvore-de-decisao'&&<DecisionTreeTradeoffs/>}
  {t.id==='arvore-de-decisao'&&<CodeNotebook cells={decisionTreePythonCells}/>}
  {t.id!=='arvore-de-decisao'&&<Grid container spacing={2}><Grid item xs={12} md={6}><Card sx={{height:'100%'}}><CardContent sx={{p:3}}><Typography variant="h6" fontWeight={750} gutterBottom>O que ela faz</Typography><Typography color="text.secondary" sx={{lineHeight:1.8}}>{t.explain.what}</Typography></CardContent></Card></Grid><Grid item xs={12} md={6}><Card sx={{height:'100%'}}><CardContent sx={{p:3}}><Typography variant="h6" fontWeight={750}>Quando usar</Typography><Box component="ul" sx={{pl:2,color:'text.secondary',lineHeight:1.8}}>{t.explain.use.map(x=><li key={x}>{x}</li>)}</Box><Divider sx={{my:2}}/><Typography variant="h6" fontWeight={750}>Quando evitar</Typography><Box component="ul" sx={{pl:2,color:'text.secondary',lineHeight:1.8}}>{t.explain.avoid.map(x=><li key={x}>{x}</li>)}</Box></CardContent></Card></Grid></Grid>}
  {t.id==='arvore-de-decisao'?<Box component="section" sx={{borderTop:"1px solid",borderColor:"divider",pt:4,mt:3}}><Typography component="h2" fontSize={25} fontWeight={850} mb={2}>Suas anotações</Typography><TextField fullWidth multiline minRows={4} value={note} onChange={(e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setNote(e.target.value)} placeholder="Explique com suas palavras como a árvore escolhe uma pergunta…"/><Typography fontSize={13} color="text.secondary" mt={1}>As anotações ficam salvas neste navegador.</Typography><Typography fontWeight={850} mt={3}>Para estudar mais</Typography><Stack direction="row" gap={2} flexWrap="wrap" mt={1}><Link href={`https://www.semanticscholar.org/search?q=${q}`} target="_blank" rel="noreferrer">Semantic Scholar</Link><Link href={`https://arxiv.org/search/?query=${q}&searchtype=all`} target="_blank" rel="noreferrer">arXiv</Link><Link href={`https://scholar.google.com/scholar?q=${q}`} target="_blank" rel="noreferrer">Google Scholar</Link></Stack></Box>:<Grid container spacing={2}><Grid item xs={12} md={7}><Card><CardContent sx={{p:3}}><Typography variant="h6" fontWeight={750} gutterBottom>Minhas anotações</Typography><TextField fullWidth multiline minRows={5} value={note} onChange={(e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setNote(e.target.value)} placeholder="Escreva com suas palavras o que você entendeu. Fica salvo neste navegador." /></CardContent></Card></Grid><Grid item xs={12} md={5}><Card><CardContent sx={{p:3}}><Typography variant="h6" fontWeight={750} gutterBottom>Quer se aprofundar?</Typography><Stack spacing={1}><Link href={`https://www.semanticscholar.org/search?q=${q}`} target="_blank" rel="noreferrer">Pesquisar no Semantic Scholar</Link><Link href={`https://arxiv.org/search/?query=${q}&searchtype=all`} target="_blank" rel="noreferrer">Pesquisar no arXiv</Link><Link href={`https://scholar.google.com/scholar?q=${q}`} target="_blank" rel="noreferrer">Pesquisar no Google Scholar</Link></Stack></CardContent></Card></Grid></Grid>}
 </Stack>
}

/** Página própria da Random Forest: a animação e os dados permanecem em features/random-forest. */
function RandomForestPage({t}:{t:ReadyTechnique}){
 const [note,setNote]=useNote(t.id)
 return <Stack spacing={3} sx={{width:'100%',maxWidth:1160,mx:'auto',minWidth:0,pb:6}}>
  <Button component={RouterLink} to="/tecnica/arvore-de-decisao" startIcon={<ArrowBackRoundedIcon/>} sx={{alignSelf:'flex-start'}}>Relembrar Decision Tree</Button>
  <Box><Typography variant="overline" color="primary.main" fontWeight={850}>APRENDIZADO SUPERVISIONADO · MODELOS BASEADOS EM ÁRVORES</Typography><Typography variant="h1" sx={{fontSize:{xs:'2.5rem',md:'3.5rem'},mt:.5}}>Random Forest</Typography><Typography sx={{fontSize:18,lineHeight:1.8,mt:1,maxWidth:850}}>Uma árvore faz perguntas e dá uma resposta. E se construíssemos várias árvores com exemplos diferentes e reuníssemos suas opiniões? É isso que uma Random Forest faz. Vamos acompanhar como ela aprende e por que suas árvores podem discordar.</Typography><Stack direction="row" gap={1} flexWrap="wrap" sx={{mt:2}}><Chip label="Aprendizado supervisionado" size="small"/><Chip label="Classificação" size="small"/><Chip label="Ensemble de árvores" size="small"/></Stack></Box>
  <Box sx={{maxWidth:790,borderLeft:'3px solid',borderColor:'primary.main',pl:2.5,py:.8}}><Typography fontWeight={850} sx={{fontSize:18,mb:1}}>Em outras palavras</Typography><Typography sx={{lineHeight:1.8}}>Random Forest é um grupo de árvores de decisão treinadas com versões sorteadas dos mesmos dados. Cada árvore aprende suas próprias regras e, juntas, elas ajudam a fazer uma previsão menos dependente de uma única árvore.</Typography><Typography sx={{lineHeight:1.7,fontSize:14,color:'text.secondary',mt:1}}>Vamos usar as mesmas dez frutas da Decision Tree para comparar os dois métodos.</Typography></Box>
  <RandomForestLesson/>
  <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4}}><Typography component="h2" sx={{fontSize:24,fontWeight:850,mb:2}}>Suas anotações</Typography><TextField multiline minRows={4} fullWidth value={note} onChange={(e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setNote(e.target.value)} placeholder="Como o bootstrap e a votação diferenciam Random Forest de uma única Decision Tree?"/><Typography fontSize={12} color="text.secondary" mt={1}>Salvas neste navegador.</Typography></Box>
 </Stack>
}

/** Registro das páginas especiais: adicionar uma técnica não exige novos ifs no roteador.
 * Conteúdo, animações e laboratórios continuam em features/<id>/;
 * páginas ainda não especializadas usam a visualização genérica existente. */
const TECHNIQUE_PAGE_REGISTRY: Record<string, React.ComponentType<{t:ReadyTechnique}>> = {
  'arvore-de-decisao': TechniqueView,
  'random-forest': RandomForestPage,
}
