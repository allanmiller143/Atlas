import { useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Slider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { treeOptions } from './TreeFamilyGuide.tsx'
import type { Technique } from '../core/types.ts'

const p={lineHeight:1.9,fontSize:16,maxWidth:780,mb:2}
const samples=[
 {color:'Alaranjada',skin:'Rugosa',name:'Laranja'},
 {color:'Vermelha',skin:'Rugosa',name:'Maçã'},
 {color:'Alaranjada',skin:'Rugosa',name:'Laranja'},
 {color:'Alaranjada',skin:'Rugosa',name:'Laranja'},
 {color:'Vermelha',skin:'Lisa',name:'Maçã'},
 {color:'Vermelha',skin:'Lisa',name:'Maçã'},
 {color:'Vermelha',skin:'Lisa',name:'Maçã'},
 {color:'Alaranjada',skin:'Lisa',name:'Laranja'},
 {color:'Vermelha',skin:'Rugosa',name:'Maçã'},
 {color:'Alaranjada',skin:'Lisa',name:'Laranja'},
]
function TreeDiagram(){
 const [skin,setSkin]=useState<'lisa'|'rugosa'>('rugosa')
 const [color,setColor]=useState<'vermelha'|'alaranjada'>('alaranjada')
 const [depth,setDepth]=useState(2)
 const [minimum,setMinimum]=useState(2)
 const branches=depth>1&&minimum<=4
 const prediction=branches?(color==='alaranjada'?'Laranja':'Maçã'):(skin==='rugosa'?'Laranja':'Maçã')
 const rootX=380,rootY=52
 const nodes=branches?[{x:190,y:180,text:'Cor alaranjada?'},{x:570,y:180,text:'Cor alaranjada?'}]:[{x:190,y:180,text:'Laranja'},{x:570,y:180,text:'Maçã'}]
 const selectedSide=skin==='rugosa'?0:1
 return <Box sx={{bgcolor:'#F3F6FB',p:{xs:2,md:3},my:3}}>
  <Typography component="h3" fontWeight={850} fontSize={22}>Veja o caminho de uma decisão</Typography>
  <Typography sx={{...p,mt:1,fontSize:15}}>Imagine oito frutas de treino, incluindo exceções. A textura costuma separar as classes, mas algumas são exceções. Primeiro a árvore pergunta sobre a textura; se puder crescer mais, ela também pode usar a cor. Mude as pistas e acompanhe o caminho em azul.</Typography>
  <Stack direction="row" gap={1} flexWrap="wrap" sx={{mb:2}}>
   <Button size="small" variant={skin==='rugosa'?'contained':'outlined'} onClick={()=>setSkin('rugosa')}>Casca rugosa</Button>
   <Button size="small" variant={skin==='lisa'?'contained':'outlined'} onClick={()=>setSkin('lisa')}>Casca lisa</Button>
   <Button size="small" variant={color==='alaranjada'?'contained':'outlined'} onClick={()=>setColor('alaranjada')}>Cor alaranjada</Button>
   <Button size="small" variant={color==='vermelha'?'contained':'outlined'} onClick={()=>setColor('vermelha')}>Cor vermelha</Button>
  </Stack>
  <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr'},gap:3,my:3}}>
   <Box><Typography fontWeight={800} fontSize={14} gutterBottom>Profundidade máxima: {depth}</Typography><Slider value={depth} min={1} max={2} step={1} marks={[{value:1,label:'1 pergunta'},{value:2,label:'Até 2 perguntas'}]} onChange={(_,value)=>setDepth(value as number)} aria-label="Profundidade máxima da árvore ilustrativa"/></Box>
   <Box><Typography fontWeight={800} fontSize={14} gutterBottom>Mínimo de exemplos para dividir: {minimum}</Typography><Slider value={minimum} min={2} max={5} step={1} marks={[{value:2,label:'2'},{value:5,label:'5'}]} onChange={(_,value)=>setMinimum(value as number)} aria-label="Mínimo de exemplos para dividir na árvore ilustrativa"/></Box>
  </Box>
  <Typography sx={{fontSize:14,color:'text.secondary',mb:1}}>O que esses controles fazem? Com profundidade 1, a árvore para após a primeira pergunta. Com mínimo de 5 exemplos, um ramo com apenas 4 exemplos não pode ser dividido novamente. Este desenho é uma <strong>simulação conceitual</strong>; o laboratório abaixo treina a implementação de verdade.</Typography>
  <Box sx={{overflowX:'auto',bgcolor:'white',p:1}}>
   <Box component="svg" viewBox="0 0 760 380" role="img" aria-label={`Árvore com profundidade ${depth} e mínimo ${minimum}. Caminho selecionado: ${skin}, cor ${color}. Previsão ${prediction}.`} sx={{width:'100%',minWidth:590,display:'block'}}>
    <title>Uma árvore representada com linhas atrás dos nós e etiquetas sem sobreposição.</title>
    <path d="M380 92 L190 149 M380 92 L570 149" stroke="#C2CFDF" strokeWidth="3" fill="none"/>
    <path d={`M380 92 L${selectedSide===0?190:570} 149`} stroke="#2E62A2" strokeWidth="5" fill="none"/>
    {branches&&<>
     {[190,570].map(x=><g key={x}><path d={`M${x} 214 L${x-92} 281 M${x} 214 L${x+92} 281`} stroke="#C2CFDF" strokeWidth="3" fill="none"/></g>)}
     <path d={`M${nodes[selectedSide].x} 214 L${nodes[selectedSide].x+(color==='alaranjada'?-92:92)} 281`} stroke="#2E62A2" strokeWidth="5" fill="none"/>
    </>}
    <rect x="268" y={rootY} width="224" height="40" rx="7" fill="#E7EFF9" stroke="#89A5C9"/>
    <text x={rootX} y="78" fontSize="17" fontWeight="800" textAnchor="middle" fill="#243F61">Casca rugosa?</text>
    {nodes.map((n,i)=><g key={i}>
      <rect x={n.x-104} y="149" width="208" height="65" rx="7" stroke={selectedSide===i?'#2E62A2':'#CCD7E5'} strokeWidth="2" fill={selectedSide===i?'#E6F0FB':'#F7F9FC'}/>
      <text x={n.x} y="185" textAnchor="middle" fontWeight="800" fontSize="16" fill="#233B57">{n.text}</text>
    </g>)}
    {/* Os rótulos ficam em faixas separadas das linhas para não colidir. */}
    <rect x="246" y="112" width="65" height="25" rx="5" fill="white" stroke="#DCE5F1"/><text x="279" y="129" fontSize="13" fontWeight="750" textAnchor="middle" fill="#315D92">Sim</text>
    <rect x="448" y="112" width="65" height="25" rx="5" fill="white" stroke="#DCE5F1"/><text x="480" y="129" fontSize="13" fontWeight="750" textAnchor="middle" fill="#315D92">Não</text>
    {branches&&[98,282,478,662].map((x,i)=><g key={i}>
      <rect x={x-78} y="281" width="156" height="56" rx="7" fill={selectedSide===Math.floor(i/2)&&(color==='alaranjada'?(i%2===0):(i%2===1))?'#DDF0E6':'#F7F9FC'} stroke="#C9D6E3"/>
      <text x={x} y="305" fontSize="12" textAnchor="middle" fill="#5A6E83">Previsão</text><text x={x} y="325" textAnchor="middle" fontWeight="800" fill="#28435E" fontSize="16">{i%2===0?'Laranja':'Maçã'}</text>
     </g>)}
    {branches&&<>
     {[98,478].map(x=><g key={x}><rect x={x+5} y="239" width="66" height="24" rx="4" fill="white" stroke="#DCE5F1"/><text x={x+38} y="256" textAnchor="middle" fontSize="12" fill="#315D92">Sim</text></g>)}
     {[282,662].map(x=><g key={x}><rect x={x-66} y="239" width="66" height="24" rx="4" fill="white" stroke="#DCE5F1"/><text x={x-33} y="256" textAnchor="middle" fontSize="12" fill="#315D92">Não</text></g>)}
    </>}
    <rect x="178" y="351" width="404" height="27" rx="5" fill="#E9F2FA"/>
    <text x="380" y="370" fontSize="14" fontWeight="800" textAnchor="middle" fill="#2C5D92">Resultado deste caminho: {prediction}</text>
   </Box>
  </Box>
  <Typography fontSize={13} color="text.secondary" sx={{mt:1.5,lineHeight:1.75}}>Observação: a árvore desenhada é um exemplo construído para ensinar a lógica. Ela não é recalculada a partir de dados reais quando você move os controles. Na experimentação abaixo, os controles de profundidade e mínimo de pontos <strong>treinam novamente</strong> a árvore sobre os pontos do gráfico.</Typography>
 </Box>
}
function TrainingWalkthrough(){
 const [stage,setStage]=useState(0)
 const stages=[
  {title:'1. Preparar exemplos e respostas',desc:'A tabela tem X (características) e y (etiqueta correta). No nosso exemplo simplificado, X é cor e textura; y é maçã ou laranja.'},
  {title:'2. Separar treino e teste',desc:'Oito exemplos serão usados para ajustar o modelo; dois ficarão reservados para verificar se ele generaliza. Em dados reais, use divisão aleatória adequada e, quando necessário, estratificação.'},
  {title:'3. Aprender usando apenas o treino',desc:'A árvore testa divisões candidatas, calcula quão misturadas ficam as classes em cada lado e escolhe uma boa pergunta. Depois repete esse processo em cada ramo até um critério de parada.'},
  {title:'4. Avaliar no conjunto reservado',desc:'Sem reaprender a partir dos exemplos de teste, o modelo prevê suas etiquetas. Só então comparamos previsão e verdade. O teste usa duas frutas de exemplo; isso não demonstra desempenho real.'},
  {title:'5. Usar com uma fruta nova',desc:'Quando chegar uma fruta que não está na tabela, aplicamos as perguntas aprendidas. A previsão pode estar errada; árvores não conhecem todas as combinações possíveis de frutas.'},
 ]
 return <Box sx={{bgcolor:'#F3F6FB',p:{xs:2,md:3},my:3}}>
  <Typography component="h3" sx={{fontSize:20,fontWeight:850,mb:1}}>Como um modelo aprende, de verdade?</Typography>
  <Typography sx={p}>{stages[stage].desc}</Typography>
  <Box sx={{overflowX:'auto',bgcolor:'white'}}><Table size="small" sx={{'& td, & th':{py:1.4,px:2}}}><TableHead><TableRow><TableCell>Cor (X)</TableCell><TableCell>Textura (X)</TableCell><TableCell>Resposta (y)</TableCell><TableCell>Conjunto</TableCell></TableRow></TableHead><TableBody>{samples.map((s,i)=><TableRow key={i} sx={{bgcolor:i<8?'#EFF5FF':'#FFF5E7'}}><TableCell>{s.color}</TableCell><TableCell>{s.skin}</TableCell><TableCell>{i>=8&&stage>=1&&stage<=3?(stage===3?`Previsão: ${s.name}`:'Resposta oculta'):s.name}</TableCell><TableCell><strong>{i<8?'Treino':'Teste'}</strong></TableCell></TableRow>)}</TableBody></Table></Box>
  <Typography sx={{fontSize:12,color:'text.secondary',mt:1.5}}>Dados fictícios: a textura tem exceções, por isso uma segunda pergunta sobre cor pode ajudar. Reservamos duas linhas apenas para demonstrar o processo, não para estimar desempenho real.</Typography>
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt:2}}><Typography fontSize={13}>Etapa {stage+1} de {stages.length}</Typography><Stack direction="row" gap={1}><Button size="small" disabled={stage===0} onClick={()=>setStage(x=>x-1)}>Voltar</Button><Button variant="contained" size="small" onClick={()=>setStage(x=>(x+1)%stages.length)}>{stage===4?'Recomeçar':'Continuar'}</Button></Stack></Stack>
  <Typography sx={{fontSize:15,fontWeight:800,mt:3}}>{stages[stage].title}</Typography>
 </Box>
}
export default function TechniqueDeepDive({technique}:{technique:Technique}){
 const isTree=technique.id==='arvore-de-decisao'
 const isForest=technique.id==='random-forest'
 const isTreeFamily=technique.compareGroups.includes('Modelos baseados em árvores')
 const explanation=isTree?'Uma árvore de decisão aprende uma sequência de perguntas sobre os dados. Ela não sabe de antemão quais perguntas fazer: experimenta maneiras de separar os exemplos do treino e escolhe as que mais ajudam a distinguir as respostas.':isForest?'Uma floresta aleatória treina muitas árvores com amostras e subconjuntos de características diferentes. Cada árvore dá sua resposta; para classificação, a floresta usa a votação do conjunto.':`A técnica ${technique.name} recebe dados e segue um procedimento de ajuste próprio. Primeiro identifique o que entra, o que o algoritmo aprende e como medir se o resultado funciona com exemplos novos.`
 return <Box sx={{width:'100%',maxWidth:1040,mx:'auto',mt:6,minWidth:0}}>
  <Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:5}}><Typography color="primary.main" fontSize={12} fontWeight={850} letterSpacing=".1em">ENTENDA DE VERDADE</Typography><Typography component="h2" sx={{fontSize:{xs:27,md:34},fontWeight:850,letterSpacing:'-.04em',my:2}}>O que acontece por trás de {technique.name}?</Typography><Typography sx={p}>{explanation}</Typography>
   {(isTree||isForest)&&<><Typography sx={p}>Pense na nossa banca de frutas: cada linha da tabela descreve uma fruta. O modelo vê exemplos, aprende relações entre textura/cor e as etiquetas e depois tenta generalizar. Cor e textura são apenas um exemplo didático — não são regras universais.</Typography>{isTree&&<TreeDiagram/>}{isForest&&<Box sx={{bgcolor:'#F3F6FB',p:3,my:3}}><Typography fontWeight={850} fontSize={20} sx={{mb:1}}>Uma floresta não é uma árvore gigante</Typography><Typography sx={p}>Imagine várias árvores treinadas com pequenas diferenças nos exemplos e nas características disponíveis. Uma árvore vota “maçã”; outra, “laranja”. A classe mais votada vira a previsão da floresta. Esse conjunto costuma ser mais estável que uma única árvore, mas não elimina a necessidade de teste.</Typography><Stack direction="row" gap={1} flexWrap="wrap"><Chip label="Árvore 1 → Maçã"/><Chip label="Árvore 2 → Laranja"/><Chip label="Árvore 3 → Maçã"/><Chip color="primary" label="Voto: Maçã"/></Stack></Box>}</>}
  </Box>
  {isTreeFamily&&<Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',pt:5,mt:5}}><Typography component="h2" sx={{fontSize:{xs:27,md:32},fontWeight:850,mb:2}}>Do dado bruto à avaliação</Typography><Typography sx={p}>Treinamento e teste são fases diferentes. O modelo deve aprender apenas com as respostas do treino. O teste verifica seu comportamento em observações que ficaram de fora.</Typography><TrainingWalkthrough/>
   <Accordion elevation={0} disableGutters sx={{borderTop:'1px solid',borderBottom:'1px solid',borderColor:'divider','&:before':{display:'none'}}}><AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>}><Typography fontWeight={850}>Ver um exemplo completo em Python</Typography></AccordionSummary><AccordionDetails><Typography sx={{...p,fontSize:14}}>Abaixo, usamos dados categóricos fictícios, transformados em números (textura rugosa = 1) para manter o exemplo executável.</Typography><Box component="pre" sx={{overflowX:'auto',p:2.5,bgcolor:'#172333',color:'white',fontSize:13,lineHeight:1.8}}>{`from sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.metrics import accuracy_score\n\n# Cada linha: [cor_alaranjada, casca_rugosa]\nX = [[0,0],[1,1],[0,0],[1,1],\n     [0,0],[1,1],[0,0],[1,1],\n     [0,0],[1,1],[0,0],[1,1]]\ny = ['maca','laranja'] * 6\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.25, random_state=42, stratify=y\n)\nmodelo = DecisionTreeClassifier(max_depth=2, random_state=42)\nmodelo.fit(X_treino, y_treino)\nprevisoes = modelo.predict(X_teste)\nprint('Acurácia de teste:', accuracy_score(y_teste, previsoes))`}</Box><Typography sx={{fontSize:13,color:'text.secondary',mt:1}}>Código de árvore didático, mesmo ao visualizar outras técnicas. Para treinar {technique.name}, substitua o estimador pelo correspondente. Os dados repetidos são artificiais e tornam o resultado pouco informativo.</Typography></AccordionDetails></Accordion>
  </Box>}
  {isTreeFamily&&<Box component="section" sx={{borderTop:'1px solid',borderColor:'divider',mt:5,pt:5}}><Typography component="h2" sx={{fontSize:{xs:25,md:32},fontWeight:850,mb:2}}>Qual modelo baseado em árvore escolher?</Typography><Typography sx={p}>A mesma tarefa de classificar frutas pode ser resolvida de várias formas. A diferença está em como cada modelo aprende e no que você ganha ou perde.</Typography><Box sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow><TableCell>Modelo</TableCell><TableCell>Quando usar</TableCell><TableCell>Limitação</TableCell></TableRow></TableHead><TableBody>{treeOptions.map(o=><TableRow key={o.id}><TableCell><Chip component={RouterLink} to={`/tecnica/${o.id}`} clickable variant={technique.id===o.id?'filled':'outlined'} color={technique.id===o.id?'primary':'default'} size="small" label={o.name} sx={{borderRadius:1}}/></TableCell><TableCell>{o.best}</TableCell><TableCell>{o.caution}</TableCell></TableRow>)}</TableBody></Table></Box></Box>}
 </Box>
}
