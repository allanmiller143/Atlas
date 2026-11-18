import { useState } from 'react'
import { Box, Button, Collapse, Divider, Stack, Typography } from '@mui/material'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'

export type NotebookCellData = { title: string; why: string; code: string; explanation: string; expected?: string }

/** Componente reaproveitável para as páginas de técnicas; não executa Python no navegador. */
export default function CodeNotebook({cells}:{cells:NotebookCellData[]}){
 const [open,setOpen]=useState(false)
 const [copied,setCopied]=useState<number|null>(null)
 const copy=async(text:string,index:number)=>{
  try{await navigator.clipboard.writeText(text);setCopied(index)}catch{setCopied(null)}
 }
 return <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:3,mt:4}}>
  <Stack direction={{xs:'column',sm:'row'}} alignItems={{xs:'stretch',sm:'center'}} justifyContent="space-between" gap={2}>
   <Box><Typography color="primary.main" fontWeight={850} fontSize={12} letterSpacing=".09em">PYTHON · NOTEBOOK DIDÁTICO</Typography><Typography component="h2" fontWeight={850} fontSize={{xs:21,md:25}} sx={{mt:.5}}>Do exemplo à implementação</Typography><Typography color="text.secondary" sx={{lineHeight:1.7,mt:.5,fontSize:14}}>Células organizadas como um caderno: leia a explicação, copie o código e execute em um notebook Python ou no Google Colab.</Typography></Box>
   <Button variant="outlined" size="medium" onClick={()=>setOpen(v=>!v)} endIcon={open?<ExpandLessRoundedIcon/>:<ExpandMoreRoundedIcon/>} aria-expanded={open} sx={{minWidth:190,alignSelf:{sm:'center'}}}>{open?'Ocultar código':'Ver código Python'}</Button>
  </Stack>
  <Collapse in={open} unmountOnExit>
   <Stack gap={3} sx={{mt:3}}>
    <Typography fontSize={13} color="text.secondary">Execute as células na ordem, de cima para baixo. Elas compartilham variáveis, como em um notebook. A página não executa Python automaticamente.</Typography>
    {cells.map((cell,index)=><Box key={cell.title} sx={{border:'1px solid',borderColor:'divider',bgcolor:'background.paper',borderRadius:1,overflow:'hidden'}}>
      <Box sx={{px:{xs:2,md:3},py:2}}><Typography fontSize={12} fontWeight={850} color="primary.main">CÉLULA {index+1} / {cells.length}</Typography><Typography component="h3" fontWeight={850} fontSize={18} mt={.4}>{cell.title}</Typography><Typography fontSize={14} lineHeight={1.8} color="text.secondary" mt={.7}>{cell.why}</Typography></Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{bgcolor:'#EAF0F8',px:2,py:.7}}><Typography fontFamily="monospace" fontSize={12} fontWeight={750} color="#405C80">In [{index+1}]:</Typography><Button size="small" startIcon={<ContentCopyRoundedIcon fontSize="small"/>} onClick={()=>copy(cell.code,index)}>{copied===index?'Copiado':'Copiar célula'}</Button></Stack>
      <Box component="pre" sx={{m:0,p:{xs:2,md:3},overflowX:'auto',bgcolor:'#172333',color:'#EAF1FC',fontSize:13,lineHeight:1.85,fontFamily:'ui-monospace, SFMono-Regular, Consolas, monospace',whiteSpace:'pre'}}><code>{cell.code}</code></Box>
      <Box sx={{px:{xs:2,md:3},py:2}}><Typography fontSize={13} fontWeight={850}>O que este código faz?</Typography><Typography fontSize={14} lineHeight={1.8} sx={{mt:.5}}>{cell.explanation}</Typography>{cell.expected&&<Box sx={{borderLeft:'3px solid #A2B8D7',pl:1.5,mt:1.5}}><Typography fontSize={12} fontWeight={850} color="text.secondary">O QUE ESPERAR</Typography><Typography fontSize={13} lineHeight={1.7}>{cell.expected}</Typography></Box>}</Box>
    </Box>)}
    <Divider/>
    <Button sx={{alignSelf:'flex-start'}} variant="text" startIcon={<ContentCopyRoundedIcon/>} onClick={()=>copy(cells.map(c=>c.code).join('\n\n'),-1)}>{copied===-1?'Notebook copiado':'Copiar todas as células'}</Button>
   </Stack>
  </Collapse>
 </Box>
}
