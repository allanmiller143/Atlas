import { useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'

/** Uma única aula visual. Os cálculos abaixo correspondem exatamente aos oito exemplos de treino. */
import { fruitExamples as data, trainingFruits } from '../core/fruitExamples.ts'
import { grow, TreeDiagram } from './DecisionTreeFruitLab.tsx'
import type { FruitExample as Example } from '../core/fruitExamples.ts'
const chapters = [
 {title:'Começamos com todos os dados',text:'Temos 10 frutas. Para cada uma, anotamos duas características (cor e textura) e a resposta correta (maçã ou laranja). Ainda não existe uma árvore: existe apenas uma tabela de exemplos.',watch:'Repare: cor e textura são as entradas (X). O nome da fruta é a resposta (y).'},
 {title:'Reservamos o teste antes de treinar',text:'Separamos 8 frutas para ensinar e 2 para conferir depois. A árvore só terá acesso às oito respostas do treino. As respostas do teste ficam guardadas até o final.',watch:'Nada foi aprendido ainda. A única mudança é quem pode participar do treinamento.'},
 {title:'A árvore escolhe a primeira pergunta',text:'O algoritmo compara perguntas possíveis. Para cada pergunta, conta quantas maçãs e laranjas ficariam em cada grupo e mede a mistura (impureza de Gini). A pergunta que mais reduz essa mistura é escolhida.',watch:'Neste conjunto, perguntar sobre a textura separa melhor do que perguntar sobre a cor. A pergunta não foi escrita por nós: foi escolhida a partir dos dados.'},
 {title:'Ela repete o processo em cada ramo',text:'As quatro frutas lisas do treino são maçãs: esse ramo termina. No grupo das quatro frutas rugosas, há uma maçã e três laranjas. A árvore testa outra pergunta: a cor é vermelha? Cada folha prevê a classe mais frequente no grupo.',watch:'Nesta árvore, as folhas ficaram puras no treino. Em outros conjuntos, uma folha pode ter respostas misturadas e a previsão será por maioria. Com limites de profundidade e tamanho mínimo, ele pode parar antes.'},
 {title:'Agora testamos sem mudar a árvore',text:'As duas frutas reservadas percorrem os ramos que a árvore aprendeu. Primeiro mostramos a previsão, depois revelamos a resposta real. Não usamos essas respostas para construir novos ramos.',watch:'Neste exemplo artificial, a árvore acerta os dois testes. Dois acertos entre apenas dois casos não permitem concluir que ela terá bom desempenho fora da demonstração.'},
]
const labelColor = (label: Example['label']) => label==='Maçã'?'#A6383F':'#975C0A'
function FruitGlyph({f}:{f:Example}){
 // O desenho representa APENAS características visíveis, nunca a classe real.
 // Assim o conjunto de teste não entrega sua resposta por meio do ícone.
 return <Box component="svg" viewBox="0 0 30 30" role="img" aria-label={`Fruta ${f.color.toLowerCase()}, casca ${f.skin.toLowerCase()}`} sx={{width:27,height:27}}>
  <circle cx="15" cy="16" r="11" fill={f.color==='Vermelha'?'#D65F67':f.color==='Esverdeada'?'#89B46E':f.color==='Amarelada'?'#E7C15E':'#E8A448'} stroke="#A9A9A9" strokeWidth=".5"/>
  <path d="M15 5 L17 2" stroke="#5B7957" strokeWidth="2" strokeLinecap="round"/>
  <path d="M17 5 Q22 1 25 6 Q21 9 17 5" fill="#6B9B71"/>
  {f.skin==='Rugosa'&&[[8,12],[15,10],[21,16],[12,21],[18,23],[9,17]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.2" fill="#FFF1D6"/>)}
 </Box>
}
function FruitRow({f,hideAnswer=false,showPrediction=false,showTruth=false}:{f:Example;hideAnswer?:boolean;showPrediction?:boolean;showTruth?:boolean}){
 const guess=f.skin==='Lisa'?'Maçã':f.color==='Vermelha'?'Maçã':'Laranja'
 return <Box sx={{display:'grid',gridTemplateColumns:'34px minmax(90px,1fr) minmax(72px,1fr) minmax(110px,1fr)',alignItems:'center',gap:1,py:1.1,px:1.5,borderBottom:'1px solid #E6EBF2',fontSize:13}}>
  <FruitGlyph f={f}/><Typography fontSize={13}>{f.color}</Typography><Typography fontSize={13}>{f.skin}</Typography>
  <Box><Typography fontSize={13} fontWeight={750} color={hideAnswer&&!showTruth?'text.secondary':labelColor(f.label)}>{hideAnswer&&!showTruth?'Resposta guardada':f.label}</Typography>{showPrediction&&<Typography fontSize={12} color="primary.main">Previsão: {guess}</Typography>}</Box>
 </Box>
}
function DataTable({items,hideAnswer=false,showPrediction=false,showTruth=false}:{items:Example[];hideAnswer?:boolean;showPrediction?:boolean;showTruth?:boolean}){
 return <Box sx={{border:'1px solid #DDE5EF',bgcolor:'#FFF',overflow:'hidden'}}><Box sx={{display:'grid',gridTemplateColumns:'34px minmax(90px,1fr) minmax(72px,1fr) minmax(110px,1fr)',gap:1,px:1.5,py:1,bgcolor:'#EFF3F9',fontSize:11,fontWeight:850,color:'#53667F'}}><span></span><span>Cor (X)</span><span>Casca (X)</span><span>Resposta (y)</span></Box>{items.map(f=><FruitRow key={f.id} f={f} hideAnswer={hideAnswer} showPrediction={showPrediction} showTruth={showTruth}/>)}</Box>
}
function SplitComparison(){
 return <Stack gap={2.5}>
  <Typography fontWeight={800} fontSize={15}>Qual pergunta produz grupos menos misturados?</Typography>
  {[{q:'A cor é vermelha?',gini:0.3,groups:[{title:'Sim · 3 frutas',a:3,b:0},{title:'Não · 5 frutas',a:2,b:3}],winner:false},
    {q:'A casca é lisa?',gini:0.1875,groups:[{title:'Sim · 4 frutas',a:4,b:0},{title:'Não · 4 frutas',a:1,b:3}],winner:true}].map(item=><Box key={item.q} sx={{border:'1px solid',borderColor:item.winner?'#4B83C6':'#DDE5EF',bgcolor:item.winner?'#F0F6FF':'#FFF',p:2}}>
     <Stack direction="row" justifyContent="space-between" gap={1} flexWrap="wrap"><Typography fontWeight={850}>{item.q}</Typography>{item.winner&&<Chip size="small" color="primary" label="Escolhida"/>}</Stack>
     <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr'},gap:2,mt:2}}>{item.groups.map(g=><Box key={g.title}><Typography fontSize={12} color="text.secondary" fontWeight={750}>{g.title}</Typography><Stack direction="row" gap={.5} sx={{my:1}}>{Array.from({length:g.a},(_,i)=><Box key={`a${i}`} sx={{height:23,width:23,borderRadius:'50%',bgcolor:'#D65F67'}} title="Maçã"/>)}{Array.from({length:g.b},(_,i)=><Box key={`b${i}`} sx={{height:23,width:23,borderRadius:'50%',bgcolor:'#E8A448'}} title="Laranja"/>)}</Stack><Typography fontSize={12}>{g.a} maçã(s) · {g.b} laranja(s)</Typography></Box>)}</Box>
     <Typography sx={{mt:1.5,fontSize:13}}>Impureza ponderada: <strong>{item.gini.toFixed(3).replace('.',',')}</strong> {item.winner?'(menor mistura)':''}</Typography>
    </Box>)}
  <Typography fontSize={13} color="text.secondary" sx={{lineHeight:1.8}}>O Gini de um grupo é 1 − (proporção de maçãs)² − (proporção de laranjas)². Calculamos a média ponderada dos grupos criados por cada pergunta. <strong>Menor valor = grupos mais puros.</strong> Aqui, antes de dividir, o Gini das oito frutas era 0,469.</Typography>
 </Stack>
}
export default function DecisionTreeLesson(){
 const [step,setStep]=useState(0)
 const [selected,setSelected]=useState(0)
 const [showAnswers,setShowAnswers]=useState(false)
 const current=chapters[step]
 function move(next:number){setStep(next);setSelected(0);setShowAnswers(false)}
 return <Box component="section" id="decision-tree-aula" sx={{borderTop:'1px solid',borderColor:'divider',pt:5,mt:3,scrollMarginTop:30}}>
  <Typography color="primary.main" fontSize={12} fontWeight={850} letterSpacing=".1em">AULA INTERATIVA · UM EXEMPLO DO COMEÇO AO FIM</Typography>
  <Typography component="h2" sx={{fontSize:{xs:27,md:35},fontWeight:850,letterSpacing:'-.04em',mt:1,mb:1.5}}>Veja a Decision Tree aprender, pergunta por pergunta</Typography>
  <Typography sx={{lineHeight:1.85,maxWidth:790,mb:3,color:'text.secondary'}}>Não vamos começar com uma árvore pronta. Vamos construí-la a partir de uma tabela pequena e descobrir <strong>por que cada divisão foi escolhida</strong>. O mesmo conjunto de frutas acompanha toda a aula.</Typography>
  <Box sx={{background:'#F3F6FB',p:{xs:2,md:3}}}>
   <Stack direction="row" gap={.8} flexWrap="wrap" sx={{mb:3}}>{chapters.map((s,i)=><Button key={i} size="small" onClick={()=>move(i)} variant={step===i?'contained':'outlined'} aria-current={step===i?'step':undefined} sx={{minWidth:42,fontWeight:850}}>{i+1}</Button>)}</Stack>
   <Box sx={{mb:2}}><Typography color="text.secondary" fontSize={12} fontWeight={800}>ETAPA {step+1} DE 5</Typography><Typography component="h3" fontSize={{xs:21,md:25}} fontWeight={850} sx={{mt:.6}}>{current.title}</Typography><Typography sx={{mt:1,lineHeight:1.85,maxWidth:820}}>{current.text}</Typography></Box>
   {step===0&&<Box><Typography fontWeight={850} sx={{mb:1}}>Conjunto completo · 10 frutas</Typography><DataTable items={data}/></Box>}
   {step===1&&<Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'1.15fr 1fr'},gap:2}}><Box><Typography fontWeight={850} sx={{mb:1}}>Treino · 8 frutas (80%)</Typography><DataTable items={data.slice(0,8)}/></Box><Box><Typography fontWeight={850} sx={{mb:1}}>Teste · 2 frutas (20%)</Typography><DataTable items={data.slice(8)} hideAnswer/><Typography fontSize={13} sx={{mt:1.5,lineHeight:1.7,color:'text.secondary'}}>As respostas existem, mas estão ocultas do algoritmo. A divisão foi fixada para tornar a demonstração reproduzível; em projetos reais, o particionamento exige cuidados adicionais.</Typography></Box></Box>}
   {step===2&&<Stack gap={2}>
    <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'minmax(0,1fr) minmax(0,1fr)'},gap:2,alignItems:'start'}}>
      <Box><Typography fontWeight={850} sx={{mb:1}}>A primeira pergunta já cria dois ramos</Typography><TreeDiagram tree={grow(trainingFruits,0,1,2)} compact/></Box>
      <Box><Typography fontWeight={850} sx={{mb:1}}>Por que escolher essa pergunta?</Typography><Box sx={{bgcolor:'white',p:2,border:'1px solid #DCE5F0'}}><Typography sx={{lineHeight:1.8,fontSize:14}}>Separamos as oito frutas do treino em dois grupos: <strong>lisas (4 maçãs)</strong> e <strong>rugosas (1 maçã, 3 laranjas)</strong>. A divisão por textura reduz mais a mistura que a pergunta “cor vermelha?”.</Typography><Typography sx={{mt:1,lineHeight:1.8,fontSize:14}}>No grupo liso, a resposta já é <strong>Maçã</strong>. No grupo rugoso, a folha temporária prevê <strong>Laranja</strong> por maioria (3 de 4), mas ainda há uma maçã misturada. Na próxima etapa, a árvore vai crescer neste ramo.</Typography></Box></Box>
    </Box>
    <Accordion disableGutters elevation={0} sx={{bgcolor:'white',border:'1px solid #DCE5F0','&:before':{display:'none'}}}><AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>}><Typography fontWeight={850}>Ver como o algoritmo compara as perguntas (Gini)</Typography></AccordionSummary><AccordionDetails><SplitComparison/></AccordionDetails></Accordion>
   </Stack>}
   {step===3&&<Stack gap={2}><TreeDiagram tree={grow(trainingFruits,0,2,2)} compact/><Typography fontSize={14} sx={{lineHeight:1.8}}>A raiz é escolhida entre as perguntas candidatas. Cada ramo recebe apenas os exemplos que passaram pela pergunta anterior. A primeira pergunta é sobre a textura; no ramo rugoso, precisamos separar as cores. O ramo rugoso precisa de mais uma pergunta: <strong>cor vermelha?</strong> Assim separamos a maçã vermelha das três laranjas. As frutas esverdeadas e lisas são maçãs verdes; a fruta amarelada e rugosa é uma laranja. Nenhuma fruta alaranjada ou amarelada foi classificada como maçã.</Typography></Stack>}
   {step===4&&<Stack gap={2}><Stack direction="row" gap={1} flexWrap="wrap">{data.slice(8).map((f,i)=><Button key={f.id} variant={selected===i?'contained':'outlined'} onClick={()=>{setSelected(i);setShowAnswers(false)}}>Teste {i+1}: {f.color.toLowerCase()}, {f.skin.toLowerCase()}</Button>)}</Stack><TreeDiagram tree={grow(trainingFruits,0,2,2)} compact focus={data[8+selected]}/><Box sx={{p:2,bgcolor:'white',border:'1px solid #DCE5F0'}}><Typography fontWeight={850}>Previsão: {data[8+selected].skin==='Lisa'?'Maçã':data[8+selected].color==='Vermelha'?'Maçã':'Laranja'}</Typography><Typography fontSize={14} color="text.secondary" sx={{mt:.5}}>Os ramos destacados em azul mostram as perguntas percorridas. A árvore não muda quando recebe um exemplo de teste.</Typography><Typography sx={{fontSize:13,mt:1}}>Caminho: {data[8+selected].skin==='Lisa'?'Casca lisa? → Sim → Maçã':`Casca lisa? → Não → Cor vermelha? → ${data[8+selected].color==='Vermelha'?'Sim → Maçã':'Não → Laranja'}`}</Typography>{showAnswers?<Typography sx={{mt:1.5,fontWeight:750,color:'#26714E'}}>Resposta real: {data[8+selected].label} · acertou neste caso</Typography>:<Button variant="outlined" size="small" onClick={()=>setShowAnswers(true)} sx={{mt:2}}>Revelar resposta do teste</Button>}</Box></Stack>}
   <Box sx={{mt:2.5,pt:2,borderTop:'1px solid #D7E2F0'}}><Typography fontSize={13} fontWeight={850} color="primary.dark">O QUE OBSERVAR</Typography><Typography sx={{mt:.5,lineHeight:1.75,fontSize:14}}>{current.watch}</Typography></Box>
   <Stack direction="row" gap={1} justifyContent="space-between" sx={{mt:3}}><Button startIcon={<ArrowBackRoundedIcon/>} disabled={step===0} onClick={()=>move(Math.max(0,step-1))}>Anterior</Button><Button variant="contained" endIcon={<ArrowForwardRoundedIcon/>} onClick={()=>move(step===4?0:step+1)}>{step===4?'Recomeçar':'Próxima etapa'}</Button></Stack>
   <LinearProgress variant="determinate" value={(step+1)*20} sx={{mt:2,height:4,borderRadius:0}}/>
  </Box>
  <Accordion elevation={0} sx={{mt:3,border:'2px solid #91ACD7',borderRadius:'10px !important',bgcolor:'#F2F7FF','&:before':{display:'none'},'&.Mui-expanded':{mt:3}}}>
   <AccordionSummary expandIcon={<ExpandMoreRoundedIcon color="primary"/>} sx={{py:1,px:2.5}}><Box><Typography color="primary.main" fontWeight={900} fontSize={12} letterSpacing=".08em">PRÓXIMO PASSO · PYTHON</Typography><Typography fontWeight={850} fontSize={18}>Ver o código completo e entender cada linha</Typography><Typography fontSize={13} color="text.secondary">Clique para abrir o exemplo com comentários, treino, teste e previsão.</Typography></Box></AccordionSummary>
   <AccordionDetails><Typography sx={{lineHeight:1.8,mb:2}}>O exemplo abaixo transforma as cores e texturas em números e repete a aula. Leia os comentários no próprio código. O modelo só aprende com X_treino e y_treino; os exemplos de teste ficam fora do fit.</Typography><Box component="pre" sx={{overflowX:'auto',p:2.5,bgcolor:'#172333',color:'white',fontSize:13,lineHeight:1.7}}>{`from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import accuracy_score

# PASSO 1 — Cada linha representa [cor_vermelha, casca_rugosa]
# 1 = sim, 0 = não. Estas são as 8 frutas usadas para aprender.
X_treino = [[1,0],[0,1],[0,0],[1,1],
            [0,1],[1,0],[0,1],[0,0]]
y_treino = ['maca','laranja','maca','maca',
            'laranja','maca','laranja','maca']

# PASSO 2 — Reservamos duas frutas, sem mostrar ao algoritmo no treino
X_teste = [[1,1],[0,1]]
y_teste = ['maca','laranja']

# PASSO 3 — Configuramos como a árvore pode crescer
# criterion='gini' mede a mistura de classes em cada grupo
# max_depth=2 permite até duas perguntas em sequência
# min_samples_split=2 permite dividir grupos com pelo menos 2 exemplos
arvore = DecisionTreeClassifier(
    criterion='gini', max_depth=2,
    min_samples_split=2, random_state=42
)
# PASSO 4 — fit aprende as perguntas SOMENTE com o treino
arvore.fit(X_treino, y_treino)
print(export_text(arvore, feature_names=['vermelha', 'rugosa']))
# PASSO 5 — predict percorre a árvore com as frutas reservadas
previsoes = arvore.predict(X_teste)
print('Previsões:', previsoes)
# PASSO 6 — Comparamos as previsões com as respostas reais
print('Acerto no teste:', accuracy_score(y_teste, previsoes))`}</Box><Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",sm:"1fr 1fr"},gap:1.5,mt:2}}>{[["fit(X_treino, y_treino)","É aqui que a árvore aprende quais perguntas usar."],["max_depth=2","Impede mais de duas perguntas consecutivas em qualquer caminho."],["min_samples_split=2","Um grupo precisa ter ao menos duas frutas para tentar outra divisão."],["predict(X_teste)","Usa as perguntas aprendidas para classificar frutas novas, sem reaprender."]].map(([term,meaning])=><Box key={term} sx={{p:1.5,bgcolor:"white",border:"1px solid #DCE5EF"}}><Typography fontFamily="monospace" fontSize={13} fontWeight={800}>{term}</Typography><Typography fontSize={13} lineHeight={1.65} mt={.5}>{meaning}</Typography></Box>)}</Box><Typography fontSize={13} color="text.secondary" sx={{mt:1.5}}>Observação: em uma implementação real, a biblioteca pode representar os ramos e empates de forma diferente do desenho pedagógico, mas as regras de divisão e as previsões deste conjunto são equivalentes.</Typography></AccordionDetails>
  </Accordion>

 </Box>
}
