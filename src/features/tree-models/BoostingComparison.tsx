import { Box, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

type Model = 'xgboost' | 'gradient-boosting'
const rows = [
  {
    aspect: 'Ideia principal',
    gb: 'Treina árvores em sequência para corrigir os erros acumulados.',
    xgb: 'Também treina árvores em sequência; acrescenta controles explícitos para o ganho das divisões e os ajustes das folhas.',
  },
  {
    aspect: 'Como escolhe perguntas',
    gb: 'Procura divisões que melhorem a função de perda durante o treinamento.',
    xgb: 'Usa informações de gradiente e segunda derivada para estimar o ganho e decidir se vale dividir.',
  },
  {
    aspect: 'Controle de complexidade',
    gb: 'Profundidade, quantidade de árvores, taxa de aprendizado e regras de tamanho das folhas.',
    xgb: 'Além desses controles, oferece parâmetros como gamma e reg_lambda para restringir divisões e valores das folhas.',
  },
  {
    aspect: 'Desempenho e implementação',
    gb: 'O GradientBoostingClassifier do scikit-learn é uma implementação tradicional, boa para aprender o conceito.',
    xgb: 'A biblioteca XGBoost inclui otimizações de treinamento, paralelismo e recursos adicionais, úteis em dados tabulares.',
  },
  {
    aspect: 'Quando experimentar',
    gb: 'Quando você quer começar com boosting de árvores e compreender seus parâmetros fundamentais.',
    xgb: 'Quando busca uma implementação com mais opções de regularização e ajuste; precisa comparar por validação.',
  },
]
export default function BoostingComparison({current}:{current:Model}){
 const other=current==='xgboost'?'/tecnica/gradient-boosting':'/tecnica/xgboost'
 const otherName=current==='xgboost'?'Gradient Boosting':'XGBoost'
 return <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:4,mt:4}}>
  <Typography component="h2" fontWeight={850} fontSize={{xs:24,md:29}} mb={1}>Gradient Boosting × XGBoost</Typography>
  <Typography sx={{lineHeight:1.8,maxWidth:850,mb:2}}>Os dois acrescentam árvores aos poucos. A diferença não é que um soma árvores e o outro não: <strong>ambos somam correções</strong>. O XGBoost é uma implementação de gradient boosting com otimizações e controles extras. Veja as diferenças práticas.</Typography>
  <Box sx={{overflowX:'auto'}}><Table size="small" sx={{'& td':{verticalAlign:'top',lineHeight:1.7}}}><TableHead><TableRow><TableCell sx={{minWidth:125}}>Aspecto</TableCell><TableCell sx={{minWidth:220}}>Gradient Boosting</TableCell><TableCell sx={{minWidth:220}}>XGBoost</TableCell></TableRow></TableHead><TableBody>{rows.map(row=><TableRow key={row.aspect}><TableCell sx={{fontWeight:800}}>{row.aspect}</TableCell><TableCell>{row.gb}</TableCell><TableCell>{row.xgb}</TableCell></TableRow>)}</TableBody></Table></Box>
  <Stack direction={{xs:'column',sm:'row'}} alignItems={{sm:'center'}} justifyContent="space-between" gap={1.5} sx={{mt:2,p:2,bgcolor:'#F5F8FC',borderLeft:'3px solid #8FAED2'}}>
   <Box><Typography fontWeight={800} fontSize={14}>Qual é melhor?</Typography><Typography fontSize={13} color="text.secondary" sx={{lineHeight:1.7}}>Não existe vencedor automático. Compare os dois nos mesmos dados, com o mesmo teste e uma validação adequada.</Typography></Box>
   <Button component={RouterLink} to={other} variant="outlined" sx={{flexShrink:0,textTransform:'none'}}>Estudar {otherName}</Button>
  </Stack>
  <Stack direction="row" gap={1} flexWrap="wrap" sx={{mt:1.5}}><Chip label="Mesmo princípio: correções sucessivas" size="small" variant="outlined"/><Chip label="Parâmetros e implementação diferentes" size="small" variant="outlined"/></Stack>
 </Box>
}
