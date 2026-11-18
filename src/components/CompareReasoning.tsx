import { useMemo, useState } from 'react'
import { Alert, Box, Chip, Grid, Slider, Stack, Typography } from '@mui/material'
import type { Dataset, ReadyTechnique } from '../core/types.ts'
import { defaultsOf } from '../core/params.ts'
import { algorithmStories } from '../core/algorithmStories.ts'
import { classColor } from '../core/colors.ts'

/** Uma única entrada, aplicada a todos os modelos. A sequência textual é conceitual;
 * a previsão usa o algoritmo efetivamente implementado e treinado nos dados compartilhados. */
export default function CompareReasoning({techniques,data}:{techniques:ReadyTechnique[];data:Dataset}){
 const [stage,setStage]=useState(0)
 const [x,setX]=useState(.35)
 const [y,setY]=useState(.65)
 const models=useMemo(()=>techniques.map(t=>{
  try{return {technique:t,model:t.fit(data,defaultsOf(t.params))}}
  catch{return {technique:t,model:null}}
 }),[techniques,data])
 const sameTask=techniques.every(t=>t.supervised===techniques[0]?.supervised)
 return <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:3,mt:3}}>
  <Typography variant="h5" fontWeight={850}>Mesma entrada, caminhos diferentes</Typography>
  <Typography sx={{color:'text.secondary',lineHeight:1.8,mt:1,maxWidth:850}}>Todos recebem o mesmo ponto (X, Y), mas usam mecanismos internos diferentes. Arraste os controles para mudar a entrada. As previsões numéricas abaixo vêm dos modelos implementados, treinados com o mesmo conjunto de dados e com os parâmetros padrão. Os passos descrevem a lógica de cada algoritmo; não são uma gravação de cada cálculo interno.</Typography>
  <Stack direction={{xs:'column',sm:'row'}} gap={3} sx={{bgcolor:'#F2F6FB',p:2.5,mt:2}}>
   <Box sx={{flex:1}}><Typography fontSize={13} fontWeight={800}>Característica horizontal (X): {x.toFixed(2)}</Typography><Slider min={0} max={1} step={.01} value={x} onChange={(_,v)=>setX(v as number)}/></Box>
   <Box sx={{flex:1}}><Typography fontSize={13} fontWeight={800}>Característica vertical (Y): {y.toFixed(2)}</Typography><Slider min={0} max={1} step={.01} value={y} onChange={(_,v)=>setY(v as number)}/></Box>
  </Stack>
  <Box sx={{mt:2,p:2,bgcolor:'#F2F6FB'}}><Typography fontWeight={850} fontSize={14}>Etapa do raciocínio: {stage+1}/5</Typography><Slider min={0} max={4} step={1} marks={[{value:0,label:'Dados'},{value:1,label:'Preparar'},{value:2,label:'Aprender'},{value:3,label:'Prever'},{value:4,label:'Conferir'}]} value={stage} onChange={(_,v)=>setStage(v as number)} aria-label="Etapa comparada entre algoritmos"/></Box>
  {!sameTask&&<Alert severity="warning" sx={{mt:2}}>Você selecionou algoritmos de tarefas diferentes. Classes previstas e grupos descobertos não significam a mesma coisa: não compare os números como se fossem respostas equivalentes.</Alert>}
  <Grid container spacing={2} sx={{mt:1}}>{models.map(({technique:t,model})=>{
   const story=algorithmStories[t.id]
   let predicted:number|null=null
   try{if(model)predicted=model.predict(x,y)}catch{predicted=null}
   return <Grid item xs={12} md={models.length===1?12:6} key={t.id}>
    <Box sx={{borderTop:'3px solid',borderColor:'primary.main',bgcolor:'#F7F9FC',p:2.5,height:'100%'}}>
     <Typography fontWeight={850} sx={{fontSize:19}}>{t.name}</Typography>
     {story&&<Box sx={{bgcolor:'#E9F2FF',p:1.5,mt:2}}><Typography fontWeight={800} fontSize={13}>{story.stages[stage].title}</Typography><Typography fontSize={13} sx={{lineHeight:1.7,mt:.5}}>{story.stages[stage].explanation}</Typography><Typography color="primary.dark" fontSize={12} sx={{mt:1}}>{story.stages[stage].observation}</Typography></Box>}
     <Typography sx={{fontSize:14,lineHeight:1.75,mt:1}}><strong>Como aprende:</strong> {story?.training??t.explain.what}</Typography>
     <Typography sx={{fontSize:14,lineHeight:1.75,mt:1}}><strong>Como responde:</strong> {story?.prediction??t.explain.what}</Typography>
     <Typography sx={{fontSize:14,lineHeight:1.75,mt:1,color:'text.secondary'}}><strong>O que o diferencia:</strong> {story?.difference??t.summary}</Typography>
     <Stack direction="row" alignItems="center" gap={1} sx={{mt:2}}><Chip size="small" sx={{bgcolor:predicted!==null?classColor(predicted):undefined,color:predicted!==null?'#fff':undefined}} label={predicted===null?'Sem previsão':`${t.supervised?'Classe':'Grupo'} ${predicted!==null?predicted+1:'?'}`}/><Typography variant="caption" color="text.secondary">Ponto ({x.toFixed(2)}, {y.toFixed(2)})</Typography></Stack>
    </Box>
   </Grid>})}</Grid>
  <Typography sx={{mt:2,fontSize:13,color:'text.secondary',lineHeight:1.7}}>Atenção: as previsões acima usam os <strong>parâmetros padrão</strong>. Os playgrounds abaixo possuem controles próprios; alterar um deles não modifica este painel. Os números das classes são os índices do conjunto de dados fictício, não nomes de frutas.</Typography>
 </Box>
}
