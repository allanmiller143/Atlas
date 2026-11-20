import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { ALL } from '../techniques/registry.ts'
import type { Output, ReadyTechnique } from '../core/types.ts'
import { useCompare } from '../state/compare.tsx'
import { compareTreeModels, getComparisonFruit, isTreeId, TREE_IDS, treeMeta, type TreeId } from '../features/comparison/treeComparison.ts'

const tasks = [
 {id:'category',name:'Classificação',summary:'Prever uma classe: maçã ou laranja, por exemplo.'},
 {id:'number',name:'Regressão',summary:'Prever um número, como o peso de uma fruta.'},
 {id:'groups',name:'Agrupamento',summary:'Encontrar grupos sem fornecer nomes corretos.'},
 {id:'reduction',name:'Redução de dimensionalidade',summary:'Representar dados usando menos características.'},
] as const
const stages = ['O problema','Como aprendem','Como respondem','Resultados']

const tag = {fontWeight:850,fontSize:11,letterSpacing:'.09em',color:'primary.main',textTransform:'uppercase'} as const
const section = {borderTop:'1px solid',borderColor:'divider',pt:4,mt:2} as const
const panel = {bgcolor:'#F3F6FA',p:{xs:2,md:2.5},borderRadius:1.5} as const
function TaskLabel({task}:{task:string}){const t=tasks.find(x=>x.id===task);return <Typography variant="body2" color="text.secondary">{t?.summary}</Typography>}

export default function ComparePage(){
 const {ids,add,remove,clear}=useCompare()
 const [task,setTask]=useState('category')
 const [stage,setStage]=useState(0)
 const [fruitIndex,setFruitIndex]=useState(0)
 const fruit=getComparisonFruit(fruitIndex)
 const options=useMemo(()=>{const output:Output=task==='category'?'category':task==='number'?'number':task==='groups'?'groups':'reduction';return ALL.filter((t):t is ReadyTechnique=>t.status==='ready'&&t.traits.output.includes(output)).sort((a,b)=>a.name.localeCompare(b.name,'pt'))},[task])
 const selected=options.filter(t=>ids.includes(t.id))
 const treeSelection=task==='category'&&selected.length>0&&selected.every(t=>isTreeId(t.id))
 const treeResults=useMemo(()=>compareTreeModels(fruit),[fruit])
 const chooseTask=(value:string)=>{setTask(value);setStage(0);clear()}
 const preset=()=>{clear();TREE_IDS.forEach(add);setTask('category');setStage(0)}
 return <Box sx={{maxWidth:1160,mx:'auto',pb:8}}>
  <Typography sx={tag}>ATLAS · COMPARAR</Typography>
  <Typography component="h1" sx={{fontSize:{xs:34,md:48},fontWeight:900,letterSpacing:'-.055em',mt:1}}>O mesmo problema. Jeitos diferentes de aprender.</Typography>
  <Typography sx={{color:'text.secondary',maxWidth:800,lineHeight:1.85,mt:1.5,fontSize:16}}>Uma comparação útil não é só descobrir quem acertou. É entender o que cada algoritmo aprendeu, como chegou à previsão e em quais situações escolher um ou outro.</Typography>

  <Box sx={{...section,mt:4}}>
   <Typography sx={tag}>01 · ESCOLHA O QUE COMPARAR</Typography>
   <Typography variant="h5" fontWeight={850} sx={{my:1}}>Que problema você quer resolver?</Typography>
   <Stack direction="row" gap={1} flexWrap="wrap" sx={{my:2}}>{tasks.map(t=><Button key={t.id} variant={task===t.id?'contained':'outlined'} onClick={()=>chooseTask(t.id)} sx={{textTransform:'none',fontWeight:750,borderRadius:1.5}}>{t.name}</Button>)}</Stack>
   <TaskLabel task={task}/>
   <Box sx={{...panel,mt:2}}>
    <Stack direction={{xs:'column',sm:'row'}} alignItems={{sm:'center'}} justifyContent="space-between" gap={2}>
     <Box><Typography fontWeight={850}>Começar pela família de árvores</Typography><Typography fontSize={13} color="text.secondary">Seleciona Decision Tree, Random Forest, Gradient Boosting, AdaBoost e XGBoost.</Typography></Box>
     <Button variant="contained" onClick={preset} sx={{whiteSpace:'nowrap',alignSelf:{xs:'stretch',sm:'center'}}}>Comparar as cinco árvores</Button>
    </Stack>
   </Box>
   <Typography fontWeight={800} sx={{mt:3,mb:1}}>Ou monte sua própria comparação</Typography>
   <Stack direction="row" flexWrap="wrap" gap={1}>{options.map(t=><Chip key={t.id} label={t.name} clickable onClick={()=>ids.includes(t.id)?remove(t.id):add(t.id)} color={ids.includes(t.id)?'primary':'default'} variant={ids.includes(t.id)?'filled':'outlined'} sx={{fontWeight:700,py:2.25,borderRadius:1.5}}/>)}{options.length===0&&<Typography color="text.secondary">Ainda não há algoritmos implementados para esta tarefa.</Typography>}</Stack>
   <Stack direction="row" alignItems="center" gap={2} sx={{mt:2}}><Typography fontSize={13} color="text.secondary">{selected.length} selecionado(s) · disponibilidade baseada nas tarefas cadastradas</Typography>{ids.length>0&&<Button size="small" color="inherit" onClick={clear}>Limpar seleção</Button>}</Stack>
   {selected.length===0&&<Alert severity="info" sx={{mt:2}}>Selecione pelo menos um algoritmo. Para conhecer a experiência completa, use “Comparar as cinco árvores”.</Alert>}
  </Box>

  {selected.length>0&&<>
   <Box sx={section}>
    <Typography sx={tag}>02 · VISÃO GERAL</Typography><Typography variant="h5" fontWeight={850} sx={{mt:1,mb:1}}>A diferença em poucas palavras</Typography>
    <TableContainer sx={{mt:2}}><Table size="small" sx={{'& td,& th':{verticalAlign:'top',px:2,py:1.7,borderColor:'divider'}}}><TableHead><TableRow><TableCell sx={{fontWeight:850,minWidth:140}}>Modelo</TableCell><TableCell sx={{fontWeight:850,minWidth:220}}>Como aprende</TableCell><TableCell sx={{fontWeight:850,minWidth:210}}>Como decide</TableCell><TableCell sx={{fontWeight:850,minWidth:160}}>Quando considerar</TableCell></TableRow></TableHead><TableBody>{selected.map(t=>{const m=isTreeId(t.id)?treeMeta[t.id]:null;return <TableRow key={t.id}><TableCell><Button component={RouterLink} to={`/tecnica/${t.id}`} sx={{p:0,justifyContent:'flex-start',textTransform:'none',fontWeight:850,textAlign:'left'}}>{t.name} <ArrowForwardRoundedIcon sx={{fontSize:14,ml:.4}}/></Button></TableCell><TableCell>{m?.training??t.summary}</TableCell><TableCell>{m?.choice??t.explain.what}</TableCell><TableCell>{m?.strength??t.explain.use[0]??'Veja a página da técnica'}</TableCell></TableRow>})}</TableBody></Table></TableContainer>
   </Box>
   {treeSelection?<>
    <Box sx={section}>
     <Typography sx={tag}>03 · AULA COMPARATIVA</Typography><Typography variant="h5" fontWeight={850} sx={{mt:1}}>Acompanhe a mesma fruta nos modelos</Typography>
     <Typography sx={{color:'text.secondary',mt:1,lineHeight:1.8,maxWidth:850}}>Usamos exatamente as oito frutas de treinamento e as duas reservadas para teste das aulas individuais. A mesma fruta passa por todos os algoritmos selecionados. Os resultados são calculados pelos simuladores didáticos de cada técnica, com parâmetros fixos.</Typography>
     <Stack direction={{xs:'column',md:'row'}} gap={2} alignItems={{md:'center'}} sx={{...panel,mt:2}}>
      <Box sx={{flex:1}}><Typography fontWeight={800}>Qual fruta vamos testar?</Typography><Typography fontSize={13} color="text.secondary">Ela não foi usada no treinamento.</Typography></Box>
      <FormControl size="small" sx={{minWidth:{xs:'100%',md:310}}}><InputLabel id="comparison-fruit-label">Fruta de teste</InputLabel><Select labelId="comparison-fruit-label" label="Fruta de teste" value={fruitIndex} onChange={e=>setFruitIndex(Number(e.target.value))}>{[0,1].map(i=>{const f=getComparisonFruit(i);return <MenuItem key={f.id} value={i}>{f.label} #{f.id} · {f.color.toLowerCase()} · {f.skin.toLowerCase()}</MenuItem>})}</Select></FormControl>
     </Stack>
     <Stack direction="row" gap={1} sx={{mt:2,flexWrap:'wrap'}}>{stages.map((s,i)=><Button size="small" key={s} variant={stage===i?'contained':'outlined'} onClick={()=>setStage(i)} sx={{textTransform:'none',fontWeight:750}}>{i+1}. {s}</Button>)}</Stack>
     <Box sx={{mt:2}}>{stage===0?<Box sx={panel}><Typography fontWeight={850}>O que os cinco recebem?</Typography><Typography sx={{lineHeight:1.8,mt:1}}>No treino: cor, textura e nome de oito frutas. No teste: uma fruta nova, com cor <strong>{fruit.color.toLowerCase()}</strong> e casca <strong>{fruit.skin.toLowerCase()}</strong>. O nome verdadeiro fica guardado até a avaliação.</Typography><Stack direction="row" gap={1} mt={2}><Chip size="small" label="8 frutas de treino"/><Chip size="small" label="2 frutas de teste"/><Chip size="small" label="Classificação"/></Stack></Box>:null}</Box>
     {stage===1&&<ComparisonRows ids={selected.map(x=>x.id).filter(isTreeId)} mode="training" fruit={fruit} results={treeResults}/>}
     {stage===2&&<ComparisonRows ids={selected.map(x=>x.id).filter(isTreeId)} mode="prediction" fruit={fruit} results={treeResults}/>}
     {stage===3&&<Box><Stack direction="row" gap={1} flexWrap="wrap" sx={{mb:2}}><Chip color="success" variant="outlined" label={`Resposta verdadeira: ${fruit.label}`}/><Chip variant="outlined" label="Demonstração com apenas 2 testes"/></Stack><ComparisonRows ids={selected.map(x=>x.id).filter(isTreeId)} mode="result" fruit={fruit} results={treeResults}/><Alert severity="info" sx={{mt:2}}>Duas frutas não bastam para determinar qual técnica é melhor. Estes resultados servem para entender os mecanismos; uma avaliação real precisa de dados representativos, métricas adequadas e validação.</Alert></Box>}
     <Stack direction="row" justifyContent="space-between" gap={2} sx={{mt:2}}><Button variant="outlined" disabled={stage===0} onClick={()=>setStage(s=>Math.max(0,s-1))}>Anterior</Button><Button variant="contained" disabled={stage===stages.length-1} onClick={()=>setStage(s=>Math.min(stages.length-1,s+1))}>Próxima etapa</Button></Stack>
    </Box>
    <Box sx={section}><Typography sx={tag}>04 · O QUE MUDA NA PRÁTICA?</Typography><Typography variant="h5" fontWeight={850} sx={{mt:1,mb:2}}>Pontos fortes e limites</Typography><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Algoritmo</TableCell><TableCell>Vantagem</TableCell><TableCell>Atenção</TableCell><TableCell>Parâmetros para estudar</TableCell></TableRow></TableHead><TableBody>{selected.map(t=>{if(!isTreeId(t.id))return null;const m=treeMeta[t.id];return <TableRow key={t.id}><TableCell sx={{fontWeight:800}}>{m.name}</TableCell><TableCell>{m.strength}</TableCell><TableCell>{m.tradeoff}</TableCell><TableCell><Typography component="code" fontSize={12}>{m.parameters}</Typography></TableCell></TableRow>})}</TableBody></Table></TableContainer></Box>
   </>:<Box sx={section}><Alert severity="info">A comparação detalhada, com a mesma fruta percorrendo os algoritmos, está disponível para os cinco modelos de árvores. Para esta seleção, você já pode comparar os mecanismos e acessar as aulas individuais. Não misturamos previsões de tarefas diferentes como se fossem a mesma resposta.</Alert></Box>}
  </>}
 </Box>
}

function ComparisonRows({ids,mode,fruit,results}:{ids:TreeId[];mode:'training'|'prediction'|'result';fruit:ReturnType<typeof getComparisonFruit>;results:ReturnType<typeof compareTreeModels>}){
 const [open,setOpen]=useState<string|null>(null)
 return <Stack gap={0} divider={<Divider/>}>{ids.map(id=>{const m=treeMeta[id],r=results[id],entries=r.entries??[];return <Box key={id} sx={{py:2.5}}><Stack direction={{xs:'column',sm:'row'}} gap={2} alignItems={{sm:'flex-start'}}><Box sx={{width:{xs:'100%',sm:175},flexShrink:0}}><Typography fontWeight={850}>{m.name}</Typography><Button component={RouterLink} to={`/tecnica/${id}`} size="small" sx={{textTransform:'none',p:0,justifyContent:'flex-start'}}>Abrir aula <ArrowForwardRoundedIcon sx={{fontSize:14,ml:.5}}/></Button></Box><Box sx={{flex:1,minWidth:0}}>{mode==='training'?<><Typography fontSize={14} lineHeight={1.8}>{m.how} {m.training}</Typography><Box sx={{mt:1.5}}><Chip label={id==='arvore-de-decisao'?'Uma árvore':id==='random-forest'?'Árvores independentes':id==='adaboost'?'Pesos dos exemplos':'Árvores sequenciais'} size="small" variant="outlined"/></Box></>:<><Typography sx={{fontSize:14,lineHeight:1.75}}>{mode==='prediction'?m.choice:r.detail}</Typography><Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" mt={1.3}><Chip color={r.predicted===fruit.label?'success':'warning'} label={`Previsão: ${r.predicted}`}/>{mode==='result'&&<Typography fontSize={13} fontWeight={750} color={r.predicted===fruit.label?'success.main':'warning.main'}>{r.predicted===fruit.label?'Acertou este exemplo':'Errou este exemplo'}</Typography>}</Stack><Button size="small" variant="text" onClick={()=>setOpen(open===id?null:id)} sx={{mt:1,textTransform:'none'}}>{open===id?'Ocultar':'Ver'} {id==='arvore-de-decisao'?'perguntas':id==='random-forest'?'votos das árvores':'contribuições das árvores'}</Button>{open===id&&<Box sx={{...panel,mt:1,p:1.5}}>{entries.map(e=><Stack key={`${id}-${e.title}`} direction={{xs:'column',sm:'row'}} gap={1.5} sx={{py:1,borderBottom:'1px solid #E2E8EF','&:last-child':{borderBottom:0}}}><Typography fontSize={13} fontWeight={800} sx={{minWidth:82}}>{e.title}</Typography><Box><Typography fontSize={13} fontWeight={750}>{e.result}</Typography>{e.extra&&<Typography fontSize={12} color="text.secondary" lineHeight={1.6}>{e.extra}</Typography>}</Box></Stack>)}</Box>}</>}</Box></Stack></Box>})}</Stack>
}
