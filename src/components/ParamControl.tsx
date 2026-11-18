import { useId, useState } from 'react'
import type { ChangeEvent, SyntheticEvent } from 'react'
import { Box, IconButton, MenuItem, Slider, Stack, TextField, Tooltip, Typography } from '@mui/material'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import type { Param, ParamValue } from '../core/types.ts'
interface Props { param:Param; value:ParamValue; onChange:(v:ParamValue)=>void }
function shown(param:Param,value:ParamValue){if(param.kind==='select')return param.options.find(o=>o.value===value)?.label??String(value);const v=Number(value);return param.step<1?v.toFixed(param.step<.01?3:2):String(v)}
export function ParamControl({param,value,onChange}:Props){
 const id=useId(); const [open,setOpen]=useState(false)
 return <Box sx={{py:1}}><Stack direction="row" alignItems="center" spacing={1}><Typography id={id} variant="body2" fontWeight={650}>{param.label}</Typography>{param.kind==='range'&&<Typography variant="caption" color="primary.main" sx={{ml:'auto!important',fontWeight:750}}>{shown(param,value)}</Typography>}<Tooltip title={param.help} open={open} onOpen={()=>setOpen(true)} onClose={()=>setOpen(false)}><IconButton size="small" aria-label={`Ajuda: ${param.label}`} onClick={()=>setOpen(!open)}><HelpOutlineRoundedIcon sx={{fontSize:17}}/></IconButton></Tooltip></Stack>
 {param.kind==='range'?<Slider aria-labelledby={id} size="small" min={param.min} max={param.max} step={param.step} value={Number(value)} onChange={(_: Event,v:number|number[])=>onChange(v as number)} />:<TextField fullWidth size="small" select value={String(value)} onChange={(e:ChangeEvent<HTMLInputElement>)=>onChange(e.target.value)}>{param.options.map(o=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</TextField>}</Box>
}
