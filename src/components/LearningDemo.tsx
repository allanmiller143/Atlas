import { useState } from 'react'
import { Box, Button, Paper, Slider, Stack, Typography } from '@mui/material'

/** Simulação didática de um neurônio; não é o treinamento real dos modelos do catálogo. */
export default function LearningDemo(){
 const [weight,setWeight]=useState(0.4)
 const [bias,setBias]=useState(-0.2)
 const [input,setInput]=useState(0.7)
 const [target,setTarget]=useState(0.8)
 const output=1/(1+Math.exp(-(weight*input+bias)))
 const error=(output-target)**2
 const step=()=>{const grad=2*(output-target)*output*(1-output);setWeight(w=>Math.max(-3,Math.min(3,w-1.5*grad*input)));setBias(b=>Math.max(-3,Math.min(3,b-1.5*grad)))}
 return <Paper variant="outlined" sx={{p:2.5,borderRadius:3}}><Stack spacing={2}>
  <Box><Typography fontWeight={800}>Mini laboratório: um neurônio aprende</Typography><Typography variant="body2" color="text.secondary">Altere entrada, peso, viés e alvo. Clique em “Aprender um passo” para reduzir o erro por gradiente.</Typography></Box>
  <Box component="svg" viewBox="0 0 520 160" sx={{width:'100%',maxHeight:180}} role="img" aria-label="Entrada conectada por um peso a um neurônio e sua saída">
   <line x1="110" y1="80" x2="244" y2="80" stroke="#8277cb" strokeWidth={2+Math.abs(weight)*3}/><line x1="298" y1="80" x2="420" y2="80" stroke="#8277cb" strokeWidth="3"/>
   <circle cx="78" cy="80" r="34" fill="#e9e6ff" stroke="#7567c9" strokeWidth="2"/><circle cx="270" cy="80" r="34" fill="#ded9ff" stroke="#7567c9" strokeWidth="2"/><circle cx="452" cy="80" r="34" fill="#e5f6f1" stroke="#2c9b80" strokeWidth="2"/>
   <text x="78" y="85" textAnchor="middle" fontSize="17" fill="#34305e">{input.toFixed(2)}</text><text x="270" y="85" textAnchor="middle" fontSize="17" fill="#34305e">σ</text><text x="452" y="85" textAnchor="middle" fontSize="17" fill="#216d5b">{output.toFixed(2)}</text>
   <text x="78" y="132" textAnchor="middle" fontSize="13" fill="currentColor">Entrada</text><text x="270" y="132" textAnchor="middle" fontSize="13" fill="currentColor">Neurônio</text><text x="452" y="132" textAnchor="middle" fontSize="13" fill="currentColor">Saída</text><text x="174" y="64" textAnchor="middle" fontSize="13" fill="currentColor">peso {weight.toFixed(2)}</text>
  </Box>
  <Stack direction={{xs:'column',md:'row'}} spacing={3}>{([{label:'Entrada',v:input,set:setInput,min:0,max:1},{label:'Peso',v:weight,set:setWeight,min:-3,max:3},{label:'Viés',v:bias,set:setBias,min:-3,max:3},{label:'Alvo',v:target,set:setTarget,min:0,max:1}]).map(s=><Box key={s.label} sx={{flex:1}}><Typography variant="caption">{s.label}: {s.v.toFixed(2)}</Typography><Slider size="small" min={s.min} max={s.max} step={0.05} value={s.v} onChange={(_,v)=>s.set(v as number)} aria-label={s.label}/></Box>)}</Stack>
  <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap"><Button variant="contained" onClick={step}>Aprender um passo</Button><Typography variant="body2">Erro quadrático: <strong>{error.toFixed(4)}</strong></Typography><Typography variant="caption" color="text.secondary">A saída se aproxima do alvo ao atualizar peso e viés.</Typography></Stack>
 </Stack></Paper>
}
