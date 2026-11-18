import { useState } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { algorithmStories } from '../core/algorithmStories.ts'
import type { ReadyTechnique } from '../core/types.ts'
export default function GuidedPlayground({technique}:{technique:ReadyTechnique}){
 const [step,setStep]=useState(0)
 const story=algorithmStories[technique.id]
 const stages=[
  {title:'Leia o gráfico antes de mexer',desc:'Cada bolinha é um exemplo de treino. O eixo horizontal e o vertical são duas características numéricas entre 0 e 1. O fundo mostra o que o modelo prevê em cada região.'},
  {title:'Mude UMA coisa por vez',desc:story?`Comece por “${story.experiment.parameter}”. ${story.experiment.change}`:'Altere um parâmetro e deixe os outros com seus valores iniciais.'},
  {title:'Compare o antes e o depois',desc:story?story.experiment.watch:'Veja se o fundo mudou de forma, se apareceram mais regiões ou se os indicadores mudaram.'},
  {title:'Entenda a limitação',desc:technique.supervised?'O percentual de acerto mostrado usa os próprios dados de treino. Sem um teste separado, ele não mede se o modelo funcionará com dados novos.':'Números dos grupos não são categorias corretas. Agrupamento mede padrões encontrados, não acerto contra etiquetas.'},
 ]
 return <Box sx={{bgcolor:'#F2F6FB',p:2.5,mb:2}}><Typography fontSize={12} color="primary.main" fontWeight={850}>ROTEIRO DO LABORATÓRIO · {step+1}/4</Typography><Typography fontWeight={850} sx={{fontSize:18,mt:.7}}>{stages[step].title}</Typography><Typography sx={{lineHeight:1.8,mt:.6,fontSize:14}}>{stages[step].desc}</Typography><Stack direction="row" spacing={1} justifyContent="flex-end" sx={{mt:1.5}}><Button size="small" disabled={step===0} onClick={()=>setStep(s=>s-1)}>Voltar</Button><Button size="small" variant="contained" onClick={()=>setStep(s=>(s+1)%stages.length)}>{step===stages.length-1?'Rever':'Próximo passo'}</Button></Stack><Alert severity="info" sx={{mt:2}}>Este laboratório reajusta o modelo com pontos fictícios; não é o exemplo da banca de frutas e ainda não realiza avaliação separada de teste.</Alert></Box>
}
