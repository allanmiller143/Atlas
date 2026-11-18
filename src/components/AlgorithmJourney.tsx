import { useState } from 'react'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import type { ReadyTechnique } from '../core/types.ts'
import { algorithmStories } from '../core/algorithmStories.ts'

/** Aula interativa por algoritmo: o mesmo problema, processos internos diferentes. */
export default function AlgorithmJourney({technique}:{technique:ReadyTechnique}){
 const story=algorithmStories[technique.id]
 const [step,setStep]=useState(0)
 if(!story)return null
 const current=story.stages[step]
 const isTree=technique.id==='arvore-de-decisao'
 const isForest=technique.id==='random-forest'
 const isClustering=technique.id==='k-means'
 const isNeural=technique.id==='rede-neural-mlp'
 const units=isForest?['Árvore A','Árvore B','Árvore C']:isClustering?['Centro 1','Centro 2','Centro 3']:isNeural?['Entrada','Camada oculta','Saída']:isTree?['Pergunta 1','Pergunta 2','Classe']:['Ponto','Hyperbox','Classe']
 return <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4,mt:2}}>
  <Typography component="h2" sx={{fontSize:{xs:25,md:32},fontWeight:850,mb:1}}>Acompanhe como {technique.name} chega à resposta</Typography>
  <Typography sx={{lineHeight:1.85,maxWidth:800,color:'text.secondary',mb:2}}>{story.situation} Avance uma etapa por vez. As figuras são esquemas conceituais; o laboratório mais abaixo calcula sobre dados numéricos.</Typography>
  <Box sx={{bgcolor:'#F2F6FB',p:{xs:2,md:3}}}>
   <Stack direction="row" gap={1} flexWrap="wrap" sx={{mb:2}}>{story.stages.map((s,i)=><Chip key={s.title} onClick={()=>setStep(i)} label={`${i+1}`} color={step===i?'primary':'default'} variant={step===i?'filled':'outlined'} aria-label={`Ir para etapa ${i+1}: ${s.title}`} />)}</Stack>
   <Typography component="h3" sx={{fontSize:21,fontWeight:800}}>{step+1}. {current.title}</Typography>
   <Typography sx={{lineHeight:1.85,mt:1,maxWidth:790}}>{current.explanation}</Typography>
   <Box sx={{bgcolor:'white',p:{xs:1.5,sm:2.5},mt:2}}>
    <Typography fontSize={12} color="text.secondary" fontWeight={800} sx={{mb:1.5}}>PROCESSO INTERNO · {technique.name.toUpperCase()}</Typography>
    <Stack direction={{xs:'column',sm:'row'}} alignItems="center" justifyContent="center" spacing={1.5} sx={{py:2}}>
     {units.map((unit,i)=><Stack key={unit} direction={{xs:'column',sm:'row'}} alignItems="center" spacing={1.5} sx={{minWidth:0}}>
      {i>0&&<Typography aria-hidden color="primary.main" fontWeight={800} sx={{transform:{xs:'rotate(90deg)',sm:'none'}}}>→</Typography>}
      <Box sx={{border:'2px solid',borderColor:step>=i?'primary.main':'divider',bgcolor:step>=i?'#E9F2FF':'#F8FAFC',px:2,py:2,minWidth:{sm:130},maxWidth:190,textAlign:'center'}}><Typography fontWeight={800} fontSize={14}>{unit}</Typography></Box>
     </Stack>)}
    </Stack>
    <Typography sx={{fontSize:13,lineHeight:1.7,color:'text.secondary',textAlign:'center'}}> {isForest?'Cada árvore pode discordar; a floresta combina votos.':isClustering?'Cada centro representa um grupo encontrado por distância.':isNeural?'Os números atravessam camadas e pesos.':isTree?'A entrada percorre um caminho de perguntas.':'A entrada é comparada com regiões aprendidas.'}</Typography>
   </Box>
   <Typography sx={{mt:2,fontSize:14,fontWeight:750,color:'primary.dark'}}>Preste atenção: {current.observation}</Typography>
   <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt:2}}><Typography variant="caption">Etapa {step+1} de {story.stages.length}</Typography><Stack direction="row" gap={1}><Button disabled={step===0} onClick={()=>setStep(x=>Math.max(0,x-1))}>Voltar</Button><Button variant="contained" onClick={()=>setStep(x=>(x+1)%story.stages.length)}>{step===story.stages.length-1?'Recomeçar':'Próxima etapa'}</Button></Stack></Stack>
  </Box>
 </Box>
}
