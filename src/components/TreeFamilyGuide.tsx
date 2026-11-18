import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export const treeOptions = [
 {id:'arvore-de-decisao',name:'Decision Tree',best:'Quando você quer explicar a previsão seguindo poucas perguntas.',caution:'Uma árvore profunda pode decorar o treino e errar em dados novos.',idea:'Uma árvore aprende divisões sucessivas.'},
 {id:'random-forest',name:'Random Forest',best:'Quando você tem dados em tabelas e quer uma base geralmente mais estável do que uma árvore isolada.',caution:'A previsão de centenas de árvores é mais difícil de explicar individualmente.',idea:'Muitas árvores diferentes votam ou fazem uma média.'},
 {id:'gradient-boosting',name:'Gradient Boosting',best:'Quando a prioridade é obter um modelo forte em dados tabulares e você pode ajustar seus parâmetros com cuidado.',caution:'Pode ser sensível a hiperparâmetros e exigir mais ajustes.',idea:'Árvores são adicionadas em sequência para melhorar o resultado.'},
 {id:'xgboost',name:'XGBoost',best:'Quando você quer uma implementação otimizada de gradient boosting em tabelas.',caution:'Exige validação e cuidado com a complexidade e o ajuste.',idea:'Gradient boosting com regularização e otimizações práticas.'},
 {id:'adaboost',name:'AdaBoost',best:'Quando quer estudar um conjunto de modelos fracos que passa a dar mais atenção a exemplos difíceis.',caution:'Pode sofrer com rótulos incorretos e observações muito atípicas.',idea:'Ajusta modelos sequenciais, reponderando exemplos difíceis.'},
]
export function TreeFamilyGuide(){return <Box component="section" id="quando-usar-arvores" sx={{scrollMarginTop:70,pt:6,pb:3,borderTop:'1px solid',borderColor:'divider'}}>
 <Typography color="primary.main" fontWeight={850} fontSize={12} letterSpacing=".09em">ESCOLHA UM MODELO</Typography>
 <Typography component="h2" sx={{fontSize:{xs:26,md:32},fontWeight:850,letterSpacing:'-.04em',my:2}}>Quando usar cada modelo baseado em árvore?</Typography>
 <Typography sx={{lineHeight:1.85,fontSize:16,maxWidth:760,mb:2}}>Todos fazem previsões a partir de perguntas sobre os dados, mas não aprendem do mesmo jeito. Use esta tabela como ponto de partida — a melhor escolha depende dos seus dados e deve ser confirmada em um conjunto de teste.</Typography>
 <Box sx={{overflowX:'auto'}}><Table size="small" sx={{'& td, & th':{verticalAlign:'top',py:2,px:1.2,minWidth:170}}}><TableHead><TableRow><TableCell>Modelo</TableCell><TableCell>Quando usar</TableCell><TableCell>Trade-off</TableCell></TableRow></TableHead><TableBody>{treeOptions.map(o=><TableRow key={o.id}><TableCell><Chip component={RouterLink} to={`/tecnica/${o.id}`} clickable label={o.name} size="small" variant="outlined" sx={{borderRadius:1,fontWeight:750}}/><Typography color="text.secondary" fontSize={12} sx={{mt:1}}>{o.idea}</Typography></TableCell><TableCell>{o.best}</TableCell><TableCell>{o.caution}</TableCell></TableRow>)}</TableBody></Table></Box>
 <Typography fontSize={13} color="text.secondary" sx={{mt:2}}>XGBoost e AdaBoost aparecem como páginas de estudo introdutórias; seus laboratórios ainda não estão implementados.</Typography>
 </Box>}
