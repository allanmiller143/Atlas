import { Link as RouterLink } from 'react-router-dom'
import { useDroppable } from '@dnd-kit/core'
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded'
import { byId } from '../techniques/registry.ts'
import { useCompare } from '../state/compare.tsx'
import { MAX_COMPARE } from '../config.ts'
export const DOCK_ID='compare-dock'
export function CompareDock(){
 const {ids,remove,clear,full}=useCompare(); const {setNodeRef,isOver}=useDroppable({id:DOCK_ID}); const items=ids.map(id=>byId(id)).filter(t=>t!==undefined)
 return <Paper ref={setNodeRef} elevation={0} sx={{position:'fixed',zIndex:30,bottom:16,left:'50%',transform:'translateX(-50%)',width:'min(850px,calc(100% - 24px))',p:1.25,pl:2,border:'1px solid',borderColor:isOver?'primary.main':'divider',borderRadius:4,boxShadow:'0 12px 40px rgba(22,30,55,.14)',bgcolor:'rgba(255,255,255,.94)',backdropFilter:'blur(14px)'}}>
  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}><Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{minWidth:0}}><CompareArrowsRoundedIcon color="primary"/><Typography variant="body2" fontWeight={700} sx={{display:{xs:'none',sm:'block'}}}>Comparação</Typography>{items.length===0?<Typography variant="caption" color="text.secondary">Adicione técnicas para comparar</Typography>:items.map(t=><Chip key={t.id} size="small" label={t.name} onDelete={()=>remove(t.id)} />)}{full&&<Typography variant="caption" color="text.secondary">Limite: {MAX_COMPARE}</Typography>}</Stack><Stack direction="row" gap={1} flexShrink={0}>{items.length>0&&<Button size="small" color="inherit" onClick={clear}>Limpar</Button>}<Button component={RouterLink} to="/comparar" size="small" variant="contained" startIcon={<CompareArrowsRoundedIcon/>}>Comparar {items.length?`(${items.length})`:''}</Button></Stack></Stack>
 </Paper>
}
