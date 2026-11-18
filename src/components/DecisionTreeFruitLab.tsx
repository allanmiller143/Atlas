import { useMemo, useState } from 'react'
import { Box, Button, Chip, Divider, Slider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

// Mesmas observações da aula: o conjunto de teste nunca participa das divisões.
import { trainingFruits as training, testingFruits as testing } from '../core/fruitExamples.ts'
import type { FruitExample as Fruit } from '../core/fruitExamples.ts'
type Question = {text:string; yes:(f:Fruit)=>boolean}
const questions:Question[] = [
 {text:'Casca lisa?',yes:f=>f.skin==='Lisa'},
 {text:'Cor vermelha?',yes:f=>f.color==='Vermelha'},
 {text:'Cor alaranjada?',yes:f=>f.color==='Alaranjada'},
 {text:'Cor esverdeada?',yes:f=>f.color==='Esverdeada'},
 {text:'Cor amarelada?',yes:f=>f.color==='Amarelada'},
]
type Node = {samples:Fruit[];label:'Maçã'|'Laranja'; question?:Question; left?:Node;right?:Node}
function gini(items:Fruit[]){if(!items.length)return 0;const apples=items.filter(x=>x.label==='Maçã').length;const p=apples/items.length;return 1-p*p-(1-p)*(1-p)}
export function grow(items:Fruit[],depth:number,maxDepth:number,minSamples:number):Node{
 const apples=items.filter(x=>x.label==='Maçã').length
 const base:Node={samples:items,label:apples>=items.length-apples?'Maçã':'Laranja'}
 if(depth>=maxDepth||items.length<minSamples||gini(items)<1e-8)return base
 let best:{q:Question;yes:Fruit[];no:Fruit[];gain:number}|undefined
 for(const q of questions){
  const yes=items.filter(q.yes),no=items.filter(f=>!q.yes(f))
  if(!yes.length||!no.length)continue
  const gain=gini(items)-(yes.length*gini(yes)+no.length*gini(no))/items.length
  if(!best||gain>best.gain+1e-9)best={q,yes,no,gain}
 }
 if(!best||best.gain<=1e-9)return base
 return {...base,question:best.q,left:grow(best.yes,depth+1,maxDepth,minSamples),right:grow(best.no,depth+1,maxDepth,minSamples)}
}
function predict(node:Node,fruit:Fruit):{result:'Maçã'|'Laranja';path:string[]}{
 const path:string[]=[];let current=node
 while(current.question&&current.left&&current.right){const yes=current.question.yes(fruit);path.push(`${current.question.text} ${yes?'Sim':'Não'}`);current=yes?current.left:current.right}
 return {result:current.label,path}
}
/** Diagrama SVG com ligações entre nós fora das caixas, sem pseudo-elementos CSS. */
export function TreeDiagram({tree,compact=false,focus}:{tree:Node;compact?:boolean;focus?:Fruit}){
 const visited=new Set<Node>();let active=tree;visited.add(active);
 if(focus){while(active.question&&active.left&&active.right){active=active.question.yes(focus)?active.left:active.right;visited.add(active)}}
 type Positioned = { node: Node; x: number; y: number; id: string }
 const nodes: Positioned[] = []
 const edges: {from: Positioned; to: Positioned; answer:string}[] = []
 const place=(node:Node,x:number,y:number,id:string):Positioned=>{
  const current={node,x,y,id};nodes.push(current)
  if(node.question&&node.left&&node.right){
   const offset=y===24?216:105
   const left=place(node.left,x-offset,y+136,`${id}y`)
   const right=place(node.right,x+offset,y+136,`${id}n`)
   edges.push({from:current,to:left,answer:'SIM'},{from:current,to:right,answer:'NÃO'})
  }
  return current
 }
 place(tree,420,24,'root')
 const height=Math.max(...nodes.map(n=>n.y))+102
 return <Box sx={{width:'100%',overflowX:'auto',bgcolor:'#FAFCFF',border:'1px solid #DCE5EF',borderRadius:1,p:{xs:1,md:2}}}>
  <Box component="svg" viewBox={`0 0 840 ${height}`} role="img" aria-label="Árvore aprendida com perguntas e folhas, com os ramos sim e não separados das caixas." sx={{display:'block',width:'100%',minWidth:{xs:compact?420:600,md:0},maxWidth:compact?700:860,mx:'auto'}}>
   {edges.map(({from,to,answer},i)=>{
    const startY=from.y+74,endY=to.y
    const midY=(startY+endY)/2
    const highlighted=Boolean(focus&&visited.has(from.node)&&visited.has(to.node))
    return <g key={i}><path d={`M${from.x} ${startY} V${midY} H${to.x} V${endY}`} stroke={highlighted?"#2766B1":"#9AB0C9"} strokeWidth={highlighted?4:2} fill="none" strokeLinejoin="round"/>
     <rect x={to.x-21} y={endY-24} width="42" height="20" rx="5" fill="#FFF" stroke="#D9E3EF"/>
     <text x={to.x} y={endY-10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#355A85">{answer}</text>
    </g>
   })}
   {nodes.map(({node,x,y,id})=>{
    const apples=node.samples.filter(f=>f.label==='Maçã').length,oranges=node.samples.length-apples
    return <g key={id}><rect x={x-92} y={y} width="184" height="74" rx="9" fill={node.question?'#E9F2FF':node.label==='Maçã'?'#FCEFF0':'#FFF4E5'} stroke={focus&&visited.has(node)?"#2766B1":node.question?'#83A9D7':node.label==='Maçã'?'#D8A1A7':'#E4BD86'} strokeWidth={focus&&visited.has(node)?3:1.5}/>
      <text x={x} y={y+28} textAnchor="middle" fill="#233C59" fontSize="15" fontWeight="750">{node.question?.text??`Previsão: ${node.label}`}</text>
      <text x={x} y={y+51} textAnchor="middle" fill="#586C80" fontSize="12">{apples} maçã(s) · {oranges} laranja(s)</text>
     </g>
   })}
  </Box>
 </Box>
}
export default function DecisionTreeFruitLab(){
 const [maxDepth,setMaxDepth]=useState(2),[minSamples,setMinSamples]=useState(2),[selected,setSelected]=useState(0)
 const tree=useMemo(()=>grow(training,0,maxDepth,minSamples),[maxDepth,minSamples])
 const splitChanges=minSamples>=5
 const splitMessage=splitChanges?'O ramo rugoso tem 4 frutas. Como são necessárias '+minSamples+' para dividi-lo, a árvore para antes da segunda pergunta.':'O ramo rugoso tem 4 frutas e pode ser dividido. Valores de 2 a 4 produzem a mesma árvore neste conjunto: isso é esperado, não é um erro.'
 const result=predict(tree,testing[selected]);const tested=testing.map(f=>predict(tree,f).result===f.label)
 const countQuestions=(n:Node):number=>n.question?1+Math.max(n.left?countQuestions(n.left):0,n.right?countQuestions(n.right):0):0
 const depth=countQuestions(tree)
 return <Box component="section" id="laboratorio-frutas" sx={{borderTop:'1px solid',borderColor:'divider',pt:5,mt:3}}>
  <Typography color="primary.main" fontSize={12} fontWeight={850} letterSpacing=".1em">EXPERIMENTE A DECISION TREE</Typography>
  <Typography component="h2" sx={{fontSize:{xs:27,md:34},fontWeight:850,letterSpacing:'-.035em',mt:1}}>Mude um parâmetro e veja a árvore mudar</Typography>
  <Typography sx={{lineHeight:1.85,maxWidth:760,mt:1,mb:3}}>Agora usamos <strong>as mesmas oito frutas do treinamento da aula</strong>, em vez de bolinhas abstratas. A árvore é recalculada quando você altera os controles. Abaixo estão as perguntas que ela realmente aprendeu com esse conjunto.</Typography>
  <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'280px minmax(0,1fr)'},gap:3,alignItems:'start'}}>
   <Box sx={{bgcolor:'#F3F6FA',p:2.5}}>
    <Typography fontWeight={850} fontSize={15}>1. Ajuste o treinamento</Typography>
    <Stack gap={3} sx={{mt:3}}>
     <Box><Stack direction="row" justifyContent="space-between"><Typography fontWeight={750} fontSize={13}>max_depth</Typography><Chip size="small" label={maxDepth}/></Stack><Typography fontSize={12} color="text.secondary" lineHeight={1.6} mt={.7}>Número máximo de perguntas em sequência. Com 1, a árvore precisa parar antes de olhar a cor no ramo rugoso.</Typography><Slider value={maxDepth} min={1} max={4} step={1} marks onChange={(_,v)=>setMaxDepth(v as number)} aria-label="max_depth"/></Box>
     <Box><Stack direction="row" justifyContent="space-between"><Typography fontWeight={750} fontSize={13}>min_samples_split</Typography><Chip size="small" label={minSamples}/></Stack><Typography fontSize={12} color="text.secondary" lineHeight={1.6} mt={.7}>Quantidade mínima de frutas necessária para continuar dividindo um grupo. O ramo rugoso tem 4 frutas. Com 5 ou mais, não é permitido fazer a segunda pergunta.</Typography><Slider value={minSamples} min={2} max={8} step={1} marks={[{value:2,label:'2'},{value:5,label:'5'},{value:8,label:'8'}]} onChange={(_,v)=>setMinSamples(v as number)} aria-label="min_samples_split"/><Typography fontSize={12} color={splitChanges?"warning.main":"text.secondary"} sx={{mt:1,lineHeight:1.65}}>{splitMessage}</Typography><Stack direction="row" spacing={1} sx={{mt:1}}><Button size="small" variant={minSamples===2?"contained":"outlined"} onClick={()=>setMinSamples(2)}>Permitir dividir · 2</Button><Button size="small" variant={minSamples===5?"contained":"outlined"} onClick={()=>setMinSamples(5)}>Impedir divisão · 5</Button></Stack></Box>
    </Stack>
    <Button variant="outlined" size="small" onClick={()=>{setMaxDepth(2);setMinSamples(2);setSelected(0)}}>Restaurar exemplo</Button>
    <Divider sx={{my:2}}/><Typography fontWeight={750} fontSize={13}>Experimente isto</Typography><Typography fontSize={13} lineHeight={1.75} mt={.7}>Coloque <strong>max_depth = 1</strong> e escolha o teste da maçã vermelha rugosa. A árvore prevê laranja porque ainda não consegue fazer a segunda pergunta. Volte para <strong>2</strong> e observe a previsão ser corrigida.</Typography>
   </Box>
   <Box sx={{minWidth:0}}>
    <Typography fontWeight={850} fontSize={15} mb={1}>2. Árvore realmente aprendida</Typography>
    <TreeDiagram tree={tree}/>
    <Typography fontSize={13} color="text.secondary" lineHeight={1.7} mt={1.5}>Com os controles atuais, a árvore usa {depth===0?'nenhuma pergunta':`${depth} pergunta(s) em sequência`} para decidir. Cada caixa mostra quantas frutas de cada classe chegaram até ali. {splitChanges&&<strong> A segunda divisão desapareceu porque min_samples_split bloqueou o grupo de quatro frutas.</strong>}</Typography>
    <Divider sx={{my:2}}/>
    <Typography fontWeight={850} fontSize={15}>3. Confira nos exemplos de teste</Typography>
    <Stack direction="row" gap={1} flexWrap="wrap" my={1.5}>{testing.map((f,i)=><Button key={f.id} size="small" variant={selected===i?'contained':'outlined'} onClick={()=>setSelected(i)}>Teste {i+1}: {f.color.toLowerCase()} + {f.skin.toLowerCase()}</Button>)}</Stack>
    <Stack direction="row" gap={1} flexWrap="wrap" mb={1}><Chip label={`Previsão: ${result.result}`} color={result.result===testing[selected].label?'success':'warning'}/><Chip variant="outlined" label={`Resposta correta: ${testing[selected].label}`}/></Stack>
    <Typography fontSize={13} lineHeight={1.75}>Caminho percorrido: {result.path.length?result.path.join(' → '):'sem perguntas (classe majoritária)'}</Typography>
    <Typography fontSize={13} sx={{mt:1.5}}><strong>Teste separado:</strong> {tested.filter(Boolean).length} de {testing.length} previsões corretas. A árvore não utilizou esses dois exemplos para aprender.</Typography>
    <Typography fontSize={12} color="text.secondary" sx={{mt:1}}>Dois exemplos de teste são poucos para medir a qualidade de um modelo real: aqui usamos esse número apenas para acompanhar o processo visualmente.</Typography>
   </Box>
  </Box>
 </Box>
}
