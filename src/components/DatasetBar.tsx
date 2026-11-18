import type { MouseEvent as ReactMouseEvent, SyntheticEvent } from 'react'
import { Box, Button, Chip, Slider, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded'
import { PRESETS } from '../core/datasets.ts'
import type { PresetId } from '../core/datasets.ts'
import { classColor } from '../core/colors.ts'
import type { DatasetControls } from '../state/useDataset.ts'
interface Props { ds:DatasetControls; brush:number; setBrush:(c:number)=>void; compact?:boolean }
export function DatasetBar({ds,brush,setBrush,compact}:Props){
 return <Stack direction={{xs:'column',lg:'row'}} spacing={2} alignItems={{lg:'center'}}>
  <Box><Typography variant="caption" color="text.secondary" fontWeight={700}>COMO OS PONTOS ESTÃO DISTRIBUÍDOS</Typography><ToggleButtonGroup exclusive size="small" value={ds.isCustom?null:ds.cfg.preset} onChange={(_: ReactMouseEvent<HTMLElement>, v: PresetId | null)=>{if(v)ds.setPreset(v)}}>{PRESETS.map(p=><ToggleButton key={p.id} value={p.id}>{p.label}</ToggleButton>)}</ToggleButtonGroup></Box>
  <Box sx={{minWidth:120,flex:1}}><Typography variant="caption" color="text.secondary">Ruído (mistura dos pontos) · {ds.cfg.noise.toFixed(2)}</Typography><Slider size="small" min={0} max={1} step={.05} value={ds.cfg.noise} onChange={(_: Event | SyntheticEvent, v: number|number[])=>ds.setNoise(v as number)} /></Box>
  <Box sx={{minWidth:120,flex:1}}><Typography variant="caption" color="text.secondary">Quantidade de exemplos · {ds.cfg.n}</Typography><Slider size="small" min={40} max={400} step={10} value={ds.cfg.n} onChange={(_: Event | SyntheticEvent, v: number|number[])=>ds.setN(v as number)} /></Box>
  <Button size="small" variant="outlined" startIcon={<ShuffleRoundedIcon/>} onClick={ds.reseed}>Gerar outros exemplos</Button>
  {!compact&&<Stack direction="row" alignItems="center" spacing={.7}><Typography variant="caption" color="text.secondary">Cor dos pontos que você adicionar</Typography>{Array.from({length:ds.data.classes},(_,c)=><Chip key={c} onClick={()=>setBrush(c)} label={c+1} size="small" variant={brush===c?'filled':'outlined'} sx={{bgcolor:brush===c?classColor(c):undefined,color:brush===c?'#fff':'text.primary',borderColor:classColor(c)}} />)}</Stack>}
 </Stack>
}
