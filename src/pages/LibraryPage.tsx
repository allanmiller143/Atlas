import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { ALL } from '../techniques/registry.ts'
import { KNOWLEDGE } from '../core/knowledge.ts'
import { QUESTIONS, matches } from '../core/taxonomy.ts'
import type { Answers } from '../core/taxonomy.ts'
import { TechniqueCard } from '../components/TechniqueCard.tsx'

export default function LibraryPage() {
  const [params,setParams] = useSearchParams()
  const [search,setSearch] = useState(params.get('busca') ?? '')
  const [status,setStatus] = useState('all')
  const [answers,setAnswers] = useState<Answers>({})
  const area = params.get('area') ?? 'all'
  const concept = params.get('conceito') ?? params.get('categoria') ?? 'all'
  const areas = [...new Set(ALL.map(t=>t.hierarchy.area))].sort((a,b)=>a.localeCompare(b,'pt'))
  const concepts = [...new Set(ALL.filter(t=>area==='all'||t.hierarchy.area===area).map(t=>t.hierarchy.concept))].sort((a,b)=>a.localeCompare(b,'pt'))
  const updateHierarchy = (nextArea: string, nextConcept: string) => setParams(cur=>{ const next=new URLSearchParams(cur); if(nextArea==='all') next.delete('area'); else next.set('area',nextArea); if(nextConcept==='all') next.delete('conceito'); else next.set('conceito',nextConcept); next.delete('categoria'); return next })
  const filtered = useMemo(()=>ALL.filter(t=>{
    const q=search.trim().toLocaleLowerCase('pt-BR')
    const matchesSearch=!q || `${t.name} ${t.hierarchy.area} ${t.hierarchy.concept} ${t.hierarchy.family} ${t.summary}`.toLocaleLowerCase('pt-BR').includes(q)
    return matchesSearch && (area==='all'||t.hierarchy.area===area) && (concept==='all'||t.hierarchy.concept===concept) && (status==='all'||t.status===status) && matches(t.traits,answers)
  }),[search,area,concept,status,answers])
  return <Stack spacing={3}>
    <Box><Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing=".12em">BIBLIOTECA</Typography><Typography variant="h1" sx={{fontSize:{xs:'2.4rem',md:'3.3rem'},mt:.5}}>Encontre sua próxima descoberta.</Typography><Typography color="text.secondary" sx={{mt:1,maxWidth:700}}>Explore as técnicas disponíveis, pesquise por assunto ou filtre por categoria. Cada técnica explica uma ideia e, quando disponível, permite experimentar.</Typography></Box>
    <Box><Typography variant="h6" fontWeight={800} sx={{mb:1.5}}>Comece por um conceito</Typography><Stack direction="row" gap={1} flexWrap="wrap">{KNOWLEDGE.filter(n=>n.level==='concept').map(n=><Button key={n.id} component={RouterLink} to={`/conceito/${n.id}`} variant="outlined" size="small">{n.name}</Button>)}</Stack></Box>
    <Paper variant="outlined" sx={{p:2,borderRadius:3}}><Stack direction={{xs:'column',md:'row'}} spacing={1.5}><TextField fullWidth value={search} onChange={(e:ChangeEvent<HTMLInputElement>)=>setSearch(e.target.value)} placeholder="Buscar técnica, conceito ou aplicação..." size="small" InputProps={{startAdornment:<InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment>}}/><TextField select size="small" label="Área macro" value={area} onChange={(e:ChangeEvent<HTMLInputElement>)=>updateHierarchy(e.target.value,'all')} sx={{minWidth:{md:210}}}><MenuItem value="all">Todas as áreas</MenuItem>{areas.map(a=><MenuItem key={a} value={a}>{a}</MenuItem>)}</TextField><TextField select size="small" label="Conceito" value={concept} onChange={(e:ChangeEvent<HTMLInputElement>)=>updateHierarchy(area,e.target.value)} sx={{minWidth:{md:220}}}><MenuItem value="all">Todos os conceitos</MenuItem>{concepts.map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField><TextField select size="small" label="Disponibilidade" value={status} onChange={(e:ChangeEvent<HTMLInputElement>)=>setStatus(e.target.value)} sx={{minWidth:{md:190}}}><MenuItem value="all">Todas</MenuItem><MenuItem value="ready">Com playground</MenuItem><MenuItem value="planned">Em breve</MenuItem></TextField></Stack></Paper>
    <Accordion disableGutters elevation={0} sx={{border:'1px solid',borderColor:'divider',borderRadius:'16px !important','&:before':{display:'none'}}}>
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><Box><Typography fontWeight={750}>Me ajude a encontrar uma técnica</Typography><Typography variant="caption" color="text.secondary">Responda o que souber; você pode pular qualquer pergunta.</Typography></Box></AccordionSummary>
      <AccordionDetails><Stack spacing={2}>{QUESTIONS.map(q=><Box key={q.key}><Typography variant="body2" fontWeight={700} sx={{mb:1}}>{q.title}</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{q.options.map(o=><Chip key={String(o.value)} clickable label={o.label} color={answers[q.key]===o.value?'primary':'default'} variant={answers[q.key]===o.value?'filled':'outlined'} onClick={()=>setAnswers(cur=>{const next:Record<string,unknown>={...cur};if(cur[q.key]===o.value)delete next[q.key];else next[q.key]=o.value;return next as Answers})}/>)}</Stack></Box>)}{Object.keys(answers).length>0&&<Button size="small" onClick={()=>setAnswers({})} sx={{alignSelf:'flex-start'}}>Limpar respostas</Button>}</Stack></AccordionDetails>
    </Accordion>
    <Stack direction="row" alignItems="center" justifyContent="space-between"><Typography fontWeight={750}>{filtered.length} {filtered.length===1?'técnica encontrada':'técnicas encontradas'}</Typography>{(search||area!=='all'||concept!=='all'||status!=='all'||Object.keys(answers).length>0)&&<Chip label="Limpar filtros" onDelete={()=>{setSearch('');setStatus('all');setParams({});setAnswers({})}} variant="outlined" />}</Stack>
    {filtered.length ? <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(2,minmax(0,1fr))',lg:'repeat(3,minmax(0,1fr))'},gap:2}}>{filtered.map(t=><TechniqueCard key={t.id} t={t} />)}</Box> : <Paper variant="outlined" sx={{p:5,textAlign:'center',borderRadius:3}}><Typography variant="h6">Nenhuma técnica encontrada</Typography><Typography color="text.secondary" sx={{mt:1}}>Tente outro termo ou remova os filtros.</Typography></Paper>}
  </Stack>
}
