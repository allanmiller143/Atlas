import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { AppBar, Box, Collapse, Drawer, IconButton, InputAdornment, ListItemButton, ListItemText, TextField, Toolbar, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { KNOWLEDGE, childrenOf, knowledgeById, nodeForTechnique, type KnowledgeNode } from '../core/knowledge.ts'
import { ALL } from '../techniques/registry.ts'
import { SITE_NAME } from '../config.ts'

export const NAV_WIDTH=364
const width=NAV_WIDTH
const itemSx={minHeight:33,py:.45,pr:.5,mb:.1,borderRadius:.6,'&.Mui-selected':{bgcolor:'#E8EEF8',color:'#214D88'},'&:hover':{bgcolor:'#EDF1F8'}}
function Navigation({close}:{close:()=>void}){
 const location=useLocation()
 const [search,setSearch]=useState('')
 const activeNode=location.pathname.startsWith('/conceito/')?knowledgeById(location.pathname.split('/').pop()):location.pathname.startsWith('/tecnica/')?nodeForTechnique(location.pathname.split('/').pop()??''):undefined
 const ancestors=new Set<string>(); let parent=activeNode; while(parent){ancestors.add(parent.id);parent=parent.parent?knowledgeById(parent.parent):undefined}
 const [expanded,setExpanded]=useState<string[]>([])
 useEffect(()=>{setExpanded(old=>Array.from(new Set([...old,...ancestors])))},[location.pathname])
 const term=search.trim().toLocaleLowerCase('pt')
 const matched=useMemo(()=>term?ALL.filter(t=>`${t.name} ${t.hierarchy.family} ${t.hierarchy.concept}`.toLocaleLowerCase('pt').includes(term)):[],[term])
 const toggle=(id:string)=>setExpanded(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id])
 function tree(node:KnowledgeNode,level=0):React.ReactNode{
  const children=childrenOf(node.id)
  const techniques=ALL.filter(t=>t.hierarchy.family===node.name&&node.level==='family'&&nodeForTechnique(t.id)?.id===node.id).sort((a,b)=>a.name.localeCompare(b.name,'pt'))
  const hasChildren=children.length>0||techniques.length>0
  const open=expanded.includes(node.id)
  const isActive=location.pathname===`/conceito/${node.id}`
  return <Box key={node.id}>
   <Box sx={{display:'flex',alignItems:'center',pl:`${Math.min(level,4)*8}px`}}>
    {hasChildren?<IconButton size="small" onClick={()=>toggle(node.id)} aria-label={`${open?'Recolher':'Expandir'} ${node.name}`} aria-expanded={open} sx={{width:27,height:27,flexShrink:0}}>{open?<ExpandMoreRoundedIcon sx={{fontSize:18}}/>:<ChevronRightRoundedIcon sx={{fontSize:18}}/>}</IconButton>:<Box sx={{width:27,flexShrink:0}}/>}
    <ListItemButton component={RouterLink} to={`/conceito/${node.id}`} selected={isActive} onClick={close} sx={{...itemSx,flex:1,minWidth:0}}><ListItemText primary={node.name} primaryTypographyProps={{fontSize:level===0?14:13.2,fontWeight:isActive?850:level===0?750:500,lineHeight:1.4,sx:{overflowWrap:'anywhere'}}}/></ListItemButton>
   </Box>
   {hasChildren&&<Collapse in={open} unmountOnExit><Box sx={{borderLeft:'1px solid #DFE6F0',ml:`${14+Math.min(level,4)*8}px`}}>
    {children.map(child=>tree(child,level+1))}
    {techniques.map(t=><Box key={t.id} sx={{pl:`${Math.min(level+1,4)*8}px`,display:'flex',alignItems:'center'}}><Box sx={{width:27,flexShrink:0}}/><ListItemButton component={RouterLink} to={`/tecnica/${t.id}`} selected={location.pathname===`/tecnica/${t.id}`} sx={itemSx} onClick={close}><ListItemText primary={t.name} primaryTypographyProps={{fontSize:13,whiteSpace:'normal',sx:{overflowWrap:'anywhere'},fontWeight:location.pathname===`/tecnica/${t.id}`?850:500}}/></ListItemButton></Box>)}
   </Box></Collapse>}
  </Box>
 }
 const roots=KNOWLEDGE.filter(n=>!n.parent).sort((a,b)=>(a.name==='Aprendizado de máquina'?-1:b.name==='Aprendizado de máquina'?1:a.name.localeCompare(b.name,'pt')))
 return <Box component="nav" aria-label="Navegação principal do Atlas" sx={{width,height:'100%',boxSizing:'border-box',overflowY:'auto',overflowX:'hidden',p:2}}>
  <Box component={RouterLink} to="/" onClick={close} sx={{textDecoration:'none',display:'block',color:'text.primary',px:1,mb:3}}><Typography fontSize={23} letterSpacing="-.055em" fontWeight={900}>{SITE_NAME}<Box component="span" sx={{color:'primary.main'}}>.</Box></Typography><Typography color="text.secondary" fontSize={12}>Aprenda IA do zero ao código</Typography></Box>
  {[['/','Início'],['/biblioteca','Todas as técnicas'],['/comparar','Comparar modelos']].map(([url,label])=><ListItemButton key={url} component={RouterLink} to={url} selected={location.pathname===url} onClick={close} sx={{...itemSx,px:1}}><ListItemText primary={label} primaryTypographyProps={{fontSize:14,fontWeight:650}}/></ListItemButton>)}
  <Box sx={{borderTop:'1px solid',borderColor:'divider',mt:2.5,pt:2.5}}><Typography color="text.secondary" fontWeight={850} fontSize={11} letterSpacing=".1em" sx={{px:1,mb:1}}>ASSUNTOS E ALGORITMOS</Typography><Typography color="text.secondary" fontSize={12} lineHeight={1.6} sx={{px:1,mb:2}}>Clique no nome para estudar. Clique na seta para abrir os subassuntos.</Typography>
   <TextField size="small" fullWidth value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar algoritmo..." aria-label="Buscar algoritmo" sx={{mb:2,'& input':{fontSize:13}}} InputProps={{startAdornment:<InputAdornment position="start"><SearchRoundedIcon fontSize="small"/></InputAdornment>}}/>
   {term?<>{matched.map(t=><ListItemButton key={t.id} component={RouterLink} to={`/tecnica/${t.id}`} onClick={close} sx={itemSx}><ListItemText primary={t.name} secondary={t.hierarchy.family} primaryTypographyProps={{fontSize:13}} secondaryTypographyProps={{fontSize:11}}/></ListItemButton>)}{matched.length===0&&<Typography color="text.secondary" fontSize={13}>Nenhum resultado.</Typography>}</>:roots.map(n=>tree(n))}
  </Box>
 </Box>
}
export function Header(){
 const [open,setOpen]=useState(false)
 const desktop=useMediaQuery(useTheme().breakpoints.up('md'))
 if(desktop)return <Drawer variant="permanent" open sx={{width,flexShrink:0,'& .MuiDrawer-paper':{width,boxSizing:'border-box',borderRight:'1px solid #E4E8EF',bgcolor:'#FAFBFD'}}}><Navigation close={()=>{}}/></Drawer>
 return <><AppBar position="sticky" color="inherit" elevation={0} sx={{borderBottom:'1px solid',borderColor:'divider'}}><Toolbar><IconButton edge="start" onClick={()=>setOpen(true)} aria-label="Abrir menu"><MenuRoundedIcon/></IconButton><Typography sx={{fontWeight:850,ml:1}}>{SITE_NAME}</Typography></Toolbar></AppBar><Drawer open={open} onClose={()=>setOpen(false)}><Navigation close={()=>setOpen(false)}/></Drawer></>
}
