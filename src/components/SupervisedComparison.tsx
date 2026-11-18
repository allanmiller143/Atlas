import { Box, Chip, Link, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { byId } from '../techniques/registry.ts'

const recommendations = [
 {id:'arvore-de-decisao',category:'Classificação e regressão',idea:'Faz perguntas sucessivas e chega a uma resposta em uma folha.',use:'Quando você precisa explicar uma decisão concreta.',limit:'Pode aprender detalhes demais do treino.'},
 {id:'random-forest',category:'Classificação e regressão',idea:'Junta a previsão de muitas árvores treinadas com diferenças.',use:'Quando quer uma base forte para dados tabulares.',limit:'É mais difícil explicar cada previsão.'},
 {id:'regressao-logistica',category:'Classificação',idea:'Calcula probabilidades para escolher uma classe.',use:'Quando quer um modelo simples para classificação.',limit:'Uma fronteira linear pode ser insuficiente.'},
 {id:'knn',category:'Classificação e regressão',idea:'Consulta os exemplos mais próximos para decidir.',use:'Quando similaridade entre exemplos é importante.',limit:'Escala e distância entre características fazem diferença.'},
 {id:'svm',category:'Classificação',idea:'Procura separar classes com uma margem ampla.',use:'Quando há fronteiras claras entre grupos.',limit:'Pode exigir ajustes e preparação dos dados.'},
 {id:'regressao-linear',category:'Regressão',idea:'Ajusta uma relação matemática para prever um número.',use:'Quando quer entender como características influenciam valores.',limit:'Não captura bem relações muito complexas sem adaptações.'},
 {id:'gradient-boosting',category:'Classificação e regressão',idea:'Constrói árvores em sequência para melhorar as previsões.',use:'Quando desempenho em tabelas é importante.',limit:'Requer validação e ajuste cuidadoso.'},
]
export default function SupervisedComparison(){return <Box component="section" id="comparacao-supervisionada" sx={{borderTop:'1px solid',borderColor:'divider',pt:5,pb:4,scrollMarginTop:80}}>
 <Typography sx={{fontSize:12,letterSpacing:'.09em',fontWeight:850,color:'primary.main',mb:1}}>ESCOLHA POR TAREFA</Typography>
 <Typography component="h2" sx={{fontSize:{xs:26,md:32},fontWeight:850,letterSpacing:'-.03em',mb:2}}>Qual técnica supervisionada estudar?</Typography>
 <Typography sx={{fontSize:16,lineHeight:1.8,maxWidth:770,mb:3}}>Todas aprendem com exemplos que têm uma resposta conhecida, mas <strong>nem todas respondem à mesma pergunta</strong>. Classificação escolhe uma categoria (maçã ou laranja). Regressão prevê um número (por exemplo, o preço da fruta).</Typography>
 <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},gap:2,mb:3}}>
  <Box sx={{borderLeft:'4px solid #4777B0',pl:2,py:1}}><Typography fontWeight={800}>Classificação</Typography><Typography color="text.secondary" fontSize={14} lineHeight={1.7}>Entrada: características da fruta. Saída: <strong>“Laranja”</strong>.</Typography></Box>
  <Box sx={{borderLeft:'4px solid #B98344',pl:2,py:1}}><Typography fontWeight={800}>Regressão</Typography><Typography color="text.secondary" fontSize={14} lineHeight={1.7}>Entrada: peso e outras características. Saída: <strong>“R$ 3,50”</strong>.</Typography></Box>
 </Box>
 <Box sx={{overflowX:'auto'}}><Table size="small" sx={{minWidth:700,'& td, & th':{py:1.8,px:1.4,verticalAlign:'top'}}}>
  <TableHead><TableRow><TableCell sx={{fontWeight:800}}>Modelo</TableCell><TableCell sx={{fontWeight:800}}>Resolve</TableCell><TableCell sx={{fontWeight:800}}>Como aprende</TableCell><TableCell sx={{fontWeight:800}}>Quando considerar</TableCell><TableCell sx={{fontWeight:800}}>Cuidado</TableCell></TableRow></TableHead>
  <TableBody>{recommendations.map(row=>{const t=byId(row.id);return <TableRow key={row.id}>
   <TableCell sx={{minWidth:145}}><Link component={RouterLink} to={`/tecnica/${row.id}`} underline="hover" sx={{fontWeight:800}}>{t?.name??row.id}</Link>{t?.status==='planned'&&<Typography color="text.secondary" fontSize={11} sx={{mt:.5}}>Página introdutória</Typography>}</TableCell>
   <TableCell sx={{minWidth:125}}><Chip size="small" variant="outlined" sx={{height:'auto','& .MuiChip-label':{whiteSpace:'normal',py:.5}}} label={row.category}/></TableCell>
   <TableCell sx={{minWidth:190,lineHeight:1.65}}>{row.idea}</TableCell><TableCell sx={{minWidth:185,lineHeight:1.65}}>{row.use}</TableCell><TableCell sx={{minWidth:165,lineHeight:1.65}}>{row.limit}</TableCell>
  </TableRow>})}</TableBody></Table></Box>
 <Typography color="text.secondary" sx={{fontSize:13,lineHeight:1.75,mt:2}}>Dica: primeiro decida se a saída deve ser uma categoria ou um número. Depois compare os modelos usando dados de teste (ou validação adequada). A tabela é um guia de estudo, não um ranking universal.</Typography>
</Box>}
