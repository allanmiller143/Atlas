import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import type { ReadyTechnique } from '../core/types.ts'
import { algorithmStories } from '../core/algorithmStories.ts'

export default function ParameterGuide({technique}:{technique:ReadyTechnique}){
 const story=algorithmStories[technique.id]
 return <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4,mt:4}}>
  <Typography component="h2" sx={{fontSize:{xs:24,md:29},fontWeight:850,mb:1}}>Quais parâmetros você pode ajustar?</Typography>
  <Typography sx={{lineHeight:1.8,color:'text.secondary',maxWidth:800,mb:2}}>Parâmetro é uma escolha feita <strong>antes ou durante o treinamento</strong> que controla como o algoritmo aprende. Ele não é a mesma coisa que um peso ou regra que o modelo descobre a partir dos dados.</Typography>
  <Box sx={{overflowX:'auto'}}><Table size="small" sx={{'& td, & th':{verticalAlign:'top',py:1.5}}}><TableHead><TableRow><TableCell sx={{minWidth:170}}>Parâmetro</TableCell><TableCell>O que muda</TableCell><TableCell sx={{minWidth:100}}>Valores disponíveis</TableCell><TableCell>Padrão</TableCell></TableRow></TableHead><TableBody>{technique.params.map(p=><TableRow key={p.key}><TableCell sx={{fontWeight:800}}>{p.label}</TableCell><TableCell sx={{lineHeight:1.75}}>{p.help}</TableCell><TableCell>{p.kind==='range'?`${p.min} até ${p.max}`:p.options.map(o=>o.label).join(' / ')}</TableCell><TableCell>{p.default}</TableCell></TableRow>)}</TableBody></Table></Box>
  {story&&<Box sx={{bgcolor:'#F2F6FB',p:2.5,mt:2}}><Typography fontWeight={850}>Experimento recomendado: {story.experiment.parameter}</Typography><Typography sx={{mt:.5,lineHeight:1.8}}>Faça assim: {story.experiment.change}</Typography><Typography color="text.secondary" sx={{mt:.5,lineHeight:1.8}}>O que observar: {story.experiment.watch}</Typography></Box>}
 </Box>
}
