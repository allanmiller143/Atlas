import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
const comparisons=[
 {case:'Explicar uma decisão',use:'Sim',why:'Você consegue seguir as perguntas do início até a folha e explicar o resultado.'},
 {case:'Criar uma referência simples',use:'Sim',why:'Treina rapidamente em muitas bases tabulares e produz regras fáceis de inspecionar.'},
 {case:'Dados com ruído ou pequenas mudanças',use:'Cuidado',why:'Uma pequena mudança no treino pode alterar bastante a forma da árvore.'},
 {case:'Alta precisão sem perder estabilidade',use:'Compare',why:'Random Forest e métodos de boosting costumam ser opções melhores para testar.'},
 {case:'Poucos dados e árvore muito profunda',use:'Evite',why:'Pode memorizar exceções e errar em exemplos novos (overfitting).'},
]
function LargeTree({expanded=false}:{expanded?:boolean}){
 // A miniatura mostra só três níveis, a visualização expandida mostra os 63 nós.
 const depth=expanded?5:3
 const width=expanded?1900:960
 const stepY=expanded?106:100
 const height=90+(depth+1)*stepY
 const coords=(level:number,index:number)=>({x:(index+.5)*width/(2**level),y:52+level*stepY})
 const lines:ReactNode[]=[];const nodes:ReactNode[]=[]
 for(let level=0;level<=depth;level++)for(let i=0;i<2**level;i++){
  const p=coords(level,i)
  if(level<depth){for(const child of [0,1]){const c=coords(level+1,i*2+child);lines.push(<path key={`l-${level}-${i}-${child}`} d={`M${p.x} ${p.y+21} L${c.x} ${c.y-21}`} stroke="#C7D4E6" strokeWidth="2" fill="none"/>)} }
  const leaf=level===depth
  const w=expanded?(leaf?50:94):(leaf?72:114)
  const color=leaf?(i%3===0?'#FFF0DC':'#E8F5ED'):(level%2===0?'#E8F1FF':'#F0F5FF')
  const border=leaf?(i%3===0?'#DAAF7C':'#9CC5AC'):'#8CAAD2'
  nodes.push(<g key={`n-${level}-${i}`}><rect x={p.x-w/2} y={p.y-24} width={w} height="48" rx="12" fill={color} stroke={border} strokeWidth="1.6"/><text x={p.x} y={p.y+4} textAnchor="middle" fill="#34516F" fontSize="12" fontWeight="700">{leaf?(i%3===0?'Laranja':'Maçã'):(level===0?'Casca?':level===1?'Cor?':`Regra ${level+1}`)}</text></g>)
 }
 return <Box sx={{overflowX:'auto',border:'1px solid #DCE5EE',borderRadius:3,p:expanded?2.5:2,bgcolor:'#F6F9FF'}}><Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{width:'100%',minWidth:expanded?1500:530,display:'block'}} role="img" aria-label={expanded?'Árvore ilustrativa de cinco níveis, com 63 nós e ramos.':'Prévia simplificada de árvore com quatro níveis.'}>{lines}{nodes}</Box></Box>
}
export default function DecisionTreeTradeoffs(){
 const [expanded,setExpanded]=useState(false)
 return <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4,mt:4}}>
  <Typography component="h2" sx={{fontSize:{xs:25,md:30},fontWeight:850,mb:1}}>Quando usar — e quando evitar?</Typography>
  <Typography sx={{lineHeight:1.8,maxWidth:810,mb:2}}>Uma árvore pequena pode ser fácil de explicar. Isso não significa que a mesma técnica será sempre a mais precisa, nem que deixar a árvore crescer indefinidamente seja uma boa ideia.</Typography>
  <Box sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow><TableCell>Situação</TableCell><TableCell>Recomendação</TableCell><TableCell>Por quê?</TableCell></TableRow></TableHead><TableBody>{comparisons.map(x=><TableRow key={x.case}><TableCell sx={{fontWeight:750}}>{x.case}</TableCell><TableCell><Chip size="small" label={x.use} color={x.use==='Sim'?'success':x.use==='Evite'?'error':'default'}/></TableCell><TableCell sx={{lineHeight:1.7}}>{x.why}</TableCell></TableRow>)}</TableBody></Table></Box>
  <Typography component="h3" sx={{fontSize:22,fontWeight:850,mt:4,mb:1}}>O problema de uma árvore que cresce demais</Typography>
  <Typography sx={{lineHeight:1.8,mb:2}}>Veja primeiro uma versão reduzida. Clique em <strong>Expandir árvore completa</strong> para explorar o desenho <strong>ilustrativo</strong> de 63 nós (31 perguntas e 32 folhas). Imagine tentar justificar cada resultado ou revisar todas as exceções. Uma árvore grande também pode aprender ruídos do treino, em vez de regras que funcionem em casos novos.</Typography>
  <Box sx={{bgcolor:'#F6F9FF',p:2,borderRadius:3}}><Stack direction={{xs:'column',sm:'row'}} alignItems={{sm:'center'}} justifyContent='space-between' gap={1} sx={{mb:1.5}}><Typography fontSize={13} fontWeight={800}>Uma árvore que não para de perguntar</Typography><Stack direction='row' gap={1}><Chip size='small' label='Azul: pergunta'/><Chip size='small' label='Verde/laranja: previsão'/></Stack></Stack><LargeTree/></Box>
  <Button sx={{mt:1.5}} variant="outlined" startIcon={<OpenInFullRoundedIcon/>} onClick={()=>setExpanded(true)}>Expandir árvore completa · 63 nós</Button>
  <Dialog fullWidth maxWidth="xl" open={expanded} onClose={()=>setExpanded(false)} PaperProps={{sx:{height:'min(90vh,900px)',maxWidth:'96vw'}}}>
   <DialogTitle sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:2}}>Uma árvore com 63 nós <IconButton onClick={()=>setExpanded(false)} aria-label="Fechar árvore"><CloseRoundedIcon/></IconButton></DialogTitle>
   <DialogContent dividers sx={{overflow:'auto',bgcolor:'#F9FBFF'}}><Typography sx={{mb:2,lineHeight:1.75}}>Agora aparecem os cinco níveis de perguntas e as 32 folhas. É um exemplo ilustrativo — não foi treinado com as dez frutas. Role horizontalmente para explorar os ramos.</Typography><LargeTree expanded/></DialogContent>
  </Dialog>
  <Stack direction="row" gap={1} flexWrap="wrap" sx={{mt:1.5}}><Chip size="small" label="Árvore da aula: poucas perguntas"/><Chip size="small" label="Exemplo ilustrativo: 63 nós"/></Stack>
  <Typography fontSize={13} color="text.secondary" sx={{lineHeight:1.75,mt:1.5}}>O diagrama grande demonstra a perda de legibilidade, não o resultado do treino com as dez frutas. Para controlar o crescimento no laboratório, altere <strong>max_depth</strong> e <strong>min_samples_split</strong>.</Typography>
 </Box>
}
