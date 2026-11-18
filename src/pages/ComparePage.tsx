import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card,
  CardContent, Checkbox, Chip, Divider, FormControlLabel, Grid, Paper,
  Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { ALL, readyById } from '../techniques/registry.ts'
import type { ReadyTechnique } from '../core/types.ts'
import { useCompare } from '../state/compare.tsx'
import { useDataset } from '../state/useDataset.ts'
import type { DatasetControls } from '../state/useDataset.ts'
import { usePlayground } from '../state/usePlayground.ts'
import { DatasetBar } from '../components/DatasetBar.tsx'
import { PlaygroundCanvas } from '../components/PlaygroundCanvas.tsx'
import { ParamControl } from '../components/ParamControl.tsx'
import CompareReasoning from '../components/CompareReasoning.tsx'
import { algorithmStories } from '../core/algorithmStories.ts'

const compareGroups = [...new Set(ALL.flatMap(t => t.compareGroups))].sort((a, b) => a.localeCompare(b, 'pt'))
const grouped = compareGroups.map(name => ({
  name,
  techniques: ALL.filter(t => t.compareGroups.includes(name)).sort((a, b) => a.name.localeCompare(b.name, 'pt')),
}))

export default function ComparePage() {
  const { ids, add, remove, clear } = useCompare()
  const ds = useDataset()
  const [brushRaw, setBrush] = useState(0)
  const brush = Math.min(brushRaw, ds.data.classes - 1)
  const selected = ids.map(id => readyById(id)).filter((t): t is ReadyTechnique => t !== undefined)

  const toggleGroup = (group: typeof grouped[number], checked: boolean) => {
    if (checked) group.techniques.filter(t => t.status === 'ready').forEach(t => add(t.id))
    else group.techniques.filter(t => t.status === 'ready').forEach(t => remove(t.id))
  }

  const presets = [
    {name:"Árvores × redes neurais · classificação", groups:["Modelos baseados em árvores","Redes neurais"], task:"Classificação"},
    {name:"Métodos de agrupamento", groups:["Agrupamento"], task:"Agrupamento"},
    {name:"Modelos baseados em árvores", groups:["Modelos baseados em árvores"], task:"Classificação"},
  ]
  const selectPreset = (groups:string[],task:string) => {clear();ALL.filter(t=>t.status==='ready'&&t.compareGroups.includes(task)&&groups.some(g=>t.compareGroups.includes(g))).forEach(t=>add(t.id))}
  return <Stack spacing={3}>
    <Box>
      <Typography variant="overline" color="primary.main" fontWeight={850} letterSpacing=".12em">LABORATÓRIO DE COMPARAÇÃO</Typography>
      <Typography variant="h1" sx={{ fontSize: { xs: '2.35rem', md: '3.2rem' }, mt: .5 }}>Compare ideias, não só algoritmos.</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760, lineHeight: 1.75 }}>Escolha modelos por tarefa ou por família. Você pode comparar, por exemplo, métodos de agrupamento entre si ou colocar modelos de árvores e redes neurais lado a lado.</Typography>
    </Box>

    <Paper variant="outlined" sx={{p:2.5,borderRadius:3}}><Typography fontWeight={800} sx={{mb:1}}>Comparações sugeridas</Typography><Typography variant="body2" color="text.secondary" sx={{mb:2}}>Os grupos funcionais são independentes da árvore de navegação. Cada atalho seleciona apenas modelos implementados que compartilham a tarefa.</Typography><Stack direction="row" gap={1} flexWrap="wrap">{presets.map(p=><Button key={p.name} variant="outlined" size="small" onClick={()=>selectPreset(p.groups,p.task)}>{p.name}</Button>)}</Stack></Paper>
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={800}>1. Monte sua comparação</Typography>
          <Typography variant="body2" color="text.secondary">Abra um grupo para selecionar técnicas individuais ou adicionar todos os modelos disponíveis daquela família.</Typography>
        </Box>
        {grouped.map(group => {
          const ready = group.techniques.filter((t): t is ReadyTechnique => t.status === 'ready')
          const planned = group.techniques.filter(t => t.status === 'planned')
          const selectedCount = ready.filter(t => ids.includes(t.id)).length
          return <Accordion key={group.name} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px !important', '&:before': { display: 'none' }, overflow: 'hidden' }}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.2} sx={{ width: '100%', pr: 1 }}>
                <Box sx={{ flex: 1 }}><Typography fontWeight={750}>{group.name}</Typography><Typography variant="caption" color="text.secondary">{ready.length} disponível(is) · {planned.length} em preparação</Typography></Box>
                <Chip size="small" color={selectedCount ? 'primary' : 'default'} label={`${selectedCount}/${ready.length}`} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
              <Stack spacing={1}>
                <Button size="small" variant="outlined" disabled={ready.length === 0} onClick={() => toggleGroup(group, selectedCount !== ready.length)} sx={{ alignSelf: 'flex-start' }}>
                  {selectedCount === ready.length && ready.length > 0 ? 'Remover grupo da comparação' : 'Adicionar todos disponíveis'}
                </Button>
                <Grid container spacing={1}>
                  {group.techniques.map(t => <Grid item xs={12} sm={6} md={4} key={t.id}>
                    <FormControlLabel sx={{ m: 0, width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1, py: .5, opacity: t.status === 'planned' ? .55 : 1 }}
                      control={<Checkbox size="small" disabled={t.status === 'planned'} checked={ids.includes(t.id)} onChange={(e: ChangeEvent<HTMLInputElement>) => e.target.checked ? add(t.id) : remove(t.id)} />}
                      label={<Box><Typography variant="body2" fontWeight={650}>{t.name}</Typography><Typography variant="caption" color="text.secondary">{t.status === 'ready' ? 'Playground disponível' : 'Playground em preparação'}</Typography></Box>} />
                  </Grid>)}
                </Grid>
              </Stack>
            </AccordionDetails>
          </Accordion>
        })}
      </Stack>
    </Paper>

    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
        <Box><Typography variant="h5" fontWeight={850}>2. Analise lado a lado</Typography><Typography variant="body2" color="text.secondary">{selected.length} modelo(s) selecionado(s)</Typography></Box>
        {selected.length > 0 && <Button color="inherit" onClick={clear}>Limpar seleção</Button>}
      </Stack>
      {selected.length > 0 && <Paper variant="outlined" sx={{mb:2,p:2,borderRadius:3,overflowX:'auto'}}><Typography variant="h6" fontWeight={800} sx={{mb:1}}>Ficha comparativa</Typography><Table size="small"><TableHead><TableRow><TableCell>Critério</TableCell>{selected.map(t=><TableCell key={t.id}><Typography fontWeight={800}>{t.name}</Typography></TableCell>)}</TableRow></TableHead><TableBody>{[
       {label:'Família',get:(t:ReadyTechnique)=>t.hierarchy.family},
       {label:'Tarefa',get:(t:ReadyTechnique)=>t.compareGroups.filter(g=>['Classificação','Agrupamento','Regressão','Redução de dimensionalidade'].includes(g)).join(', ')||'Ver detalhes'},
       {label:'Tipo de aprendizado',get:(t:ReadyTechnique)=>t.traits.learning.join(', ')||'Não especificado'},
       {label:'Interpretabilidade',get:(t:ReadyTechnique)=>['Baixa','Média','Alta'][t.traits.explainability-1]},
       {label:'Pontos fortes',get:(t:ReadyTechnique)=>t.explain.use[0]??'—'},
       {label:'Limitações',get:(t:ReadyTechnique)=>t.explain.avoid[0]??'—'},
      ].map(r=><TableRow key={r.label}><TableCell sx={{fontWeight:750,minWidth:150}}>{r.label}</TableCell>{selected.map(t=><TableCell key={t.id} sx={{minWidth:175}}>{r.get(t)}</TableCell>)}</TableRow>)}</TableBody></Table><Typography variant="caption" color="text.secondary">Comparação qualitativa. O acerto abaixo é calculado nos pontos de treino, não representa desempenho de generalização. Compare apenas métricas apropriadas à mesma tarefa.</Typography></Paper>}
      {selected.length === 0 ? <Alert severity="info" action={<Button component={RouterLink} to="/biblioteca" color="inherit">Abrir biblioteca</Button>}>Escolha pelo menos um modelo nos grupos acima para começar.</Alert> : <Stack spacing={2}>
        <Card><CardContent sx={{ p: 2.5 }}><Typography fontWeight={800} gutterBottom>Um conjunto de dados para todos</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Todos os playgrounds usam os mesmos pontos, para que você consiga observar diferenças de comportamento.</Typography><DatasetBar ds={ds} brush={brush} setBrush={setBrush} compact /></CardContent></Card>
        <CompareReasoning techniques={selected} data={ds.data}/><Grid container spacing={2}>{selected.map(t => <Grid item xs={12} md={selected.length === 1 ? 12 : 6} xl={selected.length > 4 ? 4 : 6} key={t.id}><CompareCell t={t} ds={ds} brush={brush} onRemove={() => remove(t.id)} /></Grid>)}</Grid>
      </Stack>}
    </Box>
  </Stack>
}

function CompareCell({ t, ds, brush, onRemove }: { t: ReadyTechnique; ds: DatasetControls; brush: number; onRemove: () => void }) {
  const play = usePlayground(t, ds.data)
  return <Card sx={{ height: '100%' }}><CardContent sx={{ p: 2.5 }}><Stack spacing={2}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
      <Box><Typography variant="h6" fontWeight={800}>{t.name}</Typography><Typography variant="caption" color="text.secondary">{t.hierarchy.family}</Typography></Box>
      <Button size="small" color="inherit" onClick={onRemove}>Remover</Button>
    </Stack>
    <PlaygroundCanvas data={ds.data} model={play.model} supervised={t.supervised} brush={brush} onPointsChange={ds.setPoints} />
    <Divider />
    <Typography variant="body2" sx={{lineHeight:1.75}}><strong>Como aprende:</strong> {algorithmStories[t.id]?.training??t.explain.what}</Typography>
    <Typography variant="body2" sx={{lineHeight:1.75}}><strong>Como prevê:</strong> {algorithmStories[t.id]?.prediction??t.summary}</Typography>
    {play.accuracy !== null && <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Acerto nos pontos de treino</Typography><Typography fontWeight={800}>{Math.round(play.accuracy * 100)}%</Typography></Stack>}
    {play.model?.stats?.map(s => <Stack key={s.label} direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">{s.label}</Typography><Typography fontWeight={700}>{s.value}</Typography></Stack>)}
    <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}><AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>Ajustar parâmetros</AccordionSummary><AccordionDetails>{t.params.map(p => <ParamControl key={p.key} param={p} value={play.values[p.key]} onChange={v => play.setValue(p.key, v)} />)}</AccordionDetails></Accordion>
  </Stack></CardContent></Card>
}
